const { isLive, query, memoryStore } = require('../config/db');
const { calculateItemMatch, findMatchesForCandidate } = require('../services/aiService');

/**
 * Send in-app notifications to both the lost reporter and found reporter when AI score >= 70
 */
async function createMatchNotifications(lostItem, foundItem, matchScore) {
  const scoreLabel = Math.round(matchScore);
  const notifyLostUser = {
    user_id: lostItem.user_id,
    role: 'student',
    title: `🎯 AI Match Found! (${scoreLabel}% match)`,
    message: `Your lost "${lostItem.title}" may match a found report for "${foundItem.title}". Tap to view and connect.`,
    type: 'match',
    is_read: 0,
    created_at: new Date()
  };
  const notifyFoundUser = {
    user_id: foundItem.user_id,
    role: 'student',
    title: `🎯 AI Match Found! (${scoreLabel}% match)`,
    message: `Your found "${foundItem.title}" may match a lost report for "${lostItem.title}". Tap to view and connect.`,
    type: 'match',
    is_read: 0,
    created_at: new Date()
  };

  if (isLive()) {
    await query(
      'INSERT INTO notifications (user_id, role, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [notifyLostUser.user_id, notifyLostUser.role, notifyLostUser.title, notifyLostUser.message, 'match']
    );
    await query(
      'INSERT INTO notifications (user_id, role, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [notifyFoundUser.user_id, notifyFoundUser.role, notifyFoundUser.title, notifyFoundUser.message, 'match']
    );
  } else {
    const nextId = (memoryStore.notifications || []).length + 1;
    if (!memoryStore.notifications) memoryStore.notifications = [];
    memoryStore.notifications.unshift({ id: nextId, ...notifyLostUser });
    memoryStore.notifications.unshift({ id: nextId + 1, ...notifyFoundUser });
  }
}

async function getItems(req, res) {
  try {
    const { type, category, status, search, mine } = req.query;
    const userId = req.user ? req.user.id : null;

    if (isLive()) {
      let sql = `
        SELECT lf.*, u.name as reporter_name, u.phone as reporter_phone, b.bus_number
        FROM lost_found_items lf
        LEFT JOIN users u ON lf.user_id = u.id
        LEFT JOIN buses b ON lf.bus_id = b.id
        WHERE 1=1
      `;
      const params = [];

      if (type) {
        sql += ' AND lf.type = ?';
        params.push(type);
      }
      if (category) {
        sql += ' AND lf.category = ?';
        params.push(category);
      }
      if (status) {
        sql += ' AND lf.status = ?';
        params.push(status);
      }
      if (mine === 'true' && userId) {
        sql += ' AND lf.user_id = ?';
        params.push(userId);
      }
      if (search) {
        sql += ' AND (lf.title LIKE ? OR lf.description LIKE ? OR lf.location_name LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }

      sql += ' ORDER BY lf.id DESC';
      const items = await query(sql, params);
      return res.status(200).json({ success: true, data: items });
    } else {
      let items = [...memoryStore.lost_found_items];

      if (type) items = items.filter(i => i.type === type);
      if (category) items = items.filter(i => i.category === category);
      if (status) items = items.filter(i => i.status === status);
      if (mine === 'true' && userId) items = items.filter(i => i.user_id === userId);
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(i =>
          i.title.toLowerCase().includes(s) ||
          i.description.toLowerCase().includes(s) ||
          i.location_name.toLowerCase().includes(s)
        );
      }

      const enriched = items.map(item => {
        const user = memoryStore.users.find(u => u.id === item.user_id);
        const bus = memoryStore.buses.find(b => b.id === item.bus_id);
        return {
          ...item,
          reporter_name: user ? user.name : 'University Member',
          reporter_phone: user ? user.phone : '',
          bus_number: bus ? bus.bus_number : null
        };
      }).sort((a, b) => b.id - a.id);

      return res.status(200).json({ success: true, data: enriched });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getItemById(req, res) {
  try {
    const { id } = req.params;
    let item = null;
    let matches = [];
    let claims = [];

    if (isLive()) {
      const rows = await query(
        `SELECT lf.*, u.name as reporter_name, u.phone as reporter_phone, u.email as reporter_email, b.bus_number
         FROM lost_found_items lf
         LEFT JOIN users u ON lf.user_id = u.id
         LEFT JOIN buses b ON lf.bus_id = b.id
         WHERE lf.id = ?`,
        [id]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });
      item = rows[0];

      // Fetch AI matches
      const isLost = item.type === 'lost';
      const matchSql = isLost
        ? `SELECT m.*, f.title as matched_title, f.image_url as matched_image, f.location_name as matched_location
           FROM lost_found_matches m
           JOIN lost_found_items f ON m.found_item_id = f.id
           WHERE m.lost_item_id = ? ORDER BY m.match_score DESC`
        : `SELECT m.*, l.title as matched_title, l.image_url as matched_image, l.location_name as matched_location
           FROM lost_found_matches m
           JOIN lost_found_items l ON m.lost_item_id = l.id
           WHERE m.found_item_id = ? ORDER BY m.match_score DESC`;

      matches = await query(matchSql, [id]);

      // Fetch claims
      claims = await query(
        `SELECT c.*, u.name as claimant_name, u.phone as claimant_phone 
         FROM lost_found_claims c
         JOIN users u ON c.claimant_id = u.id
         WHERE c.item_id = ? ORDER BY c.id DESC`,
        [id]
      );
    } else {
      const found = memoryStore.lost_found_items.find(i => i.id === Number(id));
      if (!found) return res.status(404).json({ success: false, message: 'Item not found' });
      const user = memoryStore.users.find(u => u.id === found.user_id);
      const bus = memoryStore.buses.find(b => b.id === found.bus_id);

      item = {
        ...found,
        reporter_name: user ? user.name : 'University Member',
        reporter_phone: user ? user.phone : '',
        reporter_email: user ? user.email : '',
        bus_number: bus ? bus.bus_number : null
      };

      const isLost = item.type === 'lost';
      matches = memoryStore.lost_found_matches
        .filter(m => (isLost ? m.lost_item_id === Number(id) : m.found_item_id === Number(id)))
        .map(m => {
          const matchedTargetId = isLost ? m.found_item_id : m.lost_item_id;
          const matchedTarget = memoryStore.lost_found_items.find(it => it.id === matchedTargetId);
          return {
            ...m,
            matched_title: matchedTarget ? matchedTarget.title : 'Item',
            matched_image: matchedTarget ? matchedTarget.image_url : null,
            matched_location: matchedTarget ? matchedTarget.location_name : ''
          };
        });

      claims = memoryStore.lost_found_claims
        .filter(c => c.item_id === Number(id))
        .map(c => {
          const claimant = memoryStore.users.find(u => u.id === c.claimant_id);
          return {
            ...c,
            claimant_name: claimant ? claimant.name : 'Student',
            claimant_phone: claimant ? claimant.phone : ''
          };
        });
    }

    return res.status(200).json({ success: true, data: { ...item, matches, claims } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createItem(req, res) {
  try {
    const { type, title, description, category = 'other', color, item_date, bus_id, seat_row, seat_number, item_time } = req.body;
    let location_name = req.body.location_name;
    const userId = req.user.id;

    // Compose rich transit seat/row/time details
    const transitParts = [];
    if (seat_row && seat_row.trim()) transitParts.push(`Row: ${seat_row.trim()}`);
    if (seat_number && seat_number.trim()) transitParts.push(`Seat: ${seat_number.trim()}`);
    if (item_time && item_time.trim()) transitParts.push(`Time: ${item_time.trim()}`);

    if (transitParts.length > 0) {
      const transitStr = transitParts.join(' • ');
      location_name = location_name && location_name.trim() ? `${location_name.trim()} (${transitStr})` : transitStr;
    }

    if (!type || !title || !description || !location_name) {
      return res.status(400).json({ success: false, message: 'type, title, description, and location/bus details are required' });
    }

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      const imgStr = req.body.image_url;
      if (imgStr.startsWith('data:image')) {
        try {
          const fs = require('fs');
          const path = require('path');
          const uploadDir = path.resolve(__dirname, '../../../uploads');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

          const matches = imgStr.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `unitrack-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
            fs.writeFileSync(path.join(uploadDir, fileName), buffer);
            image_url = `/uploads/${fileName}`;
          } else {
            image_url = imgStr;
          }
        } catch (e) {
          console.warn('Failed saving base64 image:', e);
          image_url = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400';
        }
      } else {
        image_url = imgStr;
      }
    } else {
      // Default sample image for mock presentation
      image_url = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400';
    }

    const newItemPayload = {
      user_id: userId,
      type,
      title,
      description,
      category,
      color: color || null,
      item_date: item_date || new Date().toISOString().split('T')[0],
      location_name,
      bus_id: bus_id ? Number(bus_id) : null,
      image_url,
      status: 'reported',
      created_at: new Date()
    };

    let createdId = null;

    if (isLive()) {
      const result = await query(
        `INSERT INTO lost_found_items (user_id, type, title, description, category, color, item_date, location_name, bus_id, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, type, title, description, category, color || null, newItemPayload.item_date, location_name, newItemPayload.bus_id, image_url, 'reported']
      );
      createdId = result.insertId;
      newItemPayload.id = createdId;

      // Run AI matcher against existing opposite items
      const oppositeType = type === 'lost' ? 'found' : 'lost';
      const oppositeItems = await query('SELECT * FROM lost_found_items WHERE type = ? AND status != "resolved"', [oppositeType]);
      const matches = findMatchesForCandidate(newItemPayload, oppositeItems);

      for (const m of matches) {
        await query(
          'INSERT INTO lost_found_matches (lost_item_id, found_item_id, match_score, match_reasons, status) VALUES (?, ?, ?, ?, "suggested") ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), match_reasons = VALUES(match_reasons)',
          [m.lost_item_id, m.found_item_id, m.match_score, m.match_reasons]
        );

        if (m.match_score >= 70) {
          await query('UPDATE lost_found_items SET status = "matched" WHERE id IN (?, ?)', [m.lost_item_id, m.found_item_id]);
          // Fetch both items to create notifications
          const lostRows = await query('SELECT * FROM lost_found_items WHERE id = ?', [m.lost_item_id]);
          const foundRows = await query('SELECT * FROM lost_found_items WHERE id = ?', [m.found_item_id]);
          if (lostRows.length > 0 && foundRows.length > 0) {
            await createMatchNotifications(lostRows[0], foundRows[0], m.match_score);
          }
        }
      }
    } else {
      createdId = memoryStore.lost_found_items.length + 1;
      newItemPayload.id = createdId;
      memoryStore.lost_found_items.unshift(newItemPayload);

      // Run AI matcher in-memory
      const oppositeItems = memoryStore.lost_found_items.filter(i => i.type !== type && i.status !== 'resolved' && i.id !== createdId);
      const matches = findMatchesForCandidate(newItemPayload, oppositeItems);

      for (const m of matches) {
        // Avoid duplicate matches in memory store
        const existing = memoryStore.lost_found_matches.find(
          x => x.lost_item_id === m.lost_item_id && x.found_item_id === m.found_item_id
        );
        if (existing) {
          existing.match_score = m.match_score;
          existing.match_reasons = m.match_reasons;
        } else {
          memoryStore.lost_found_matches.push({
            id: memoryStore.lost_found_matches.length + 1,
            lost_item_id: m.lost_item_id,
            found_item_id: m.found_item_id,
            match_score: m.match_score,
            match_reasons: m.match_reasons,
            status: 'suggested',
            created_at: new Date()
          });
        }

        if (m.match_score >= 70) {
          const item1 = memoryStore.lost_found_items.find(x => x.id === m.lost_item_id);
          const item2 = memoryStore.lost_found_items.find(x => x.id === m.found_item_id);
          if (item1) item1.status = 'matched';
          if (item2) item2.status = 'matched';
          // Notify both users
          if (item1 && item2) {
            await createMatchNotifications(item1, item2, m.match_score);
          }
        }
      }

      // Return match count in response
      const highMatches = matches.filter(m => m.match_score >= 70);
      const suggestedMatches = matches.filter(m => m.match_score >= 45 && m.match_score < 70);

      return res.status(201).json({
        success: true,
        message: highMatches.length > 0
          ? `🎯 Item reported! AI found ${highMatches.length} strong match(es) — both users notified.`
          : suggestedMatches.length > 0
          ? `Item reported! AI found ${suggestedMatches.length} possible match(es) — check item details.`
          : 'Item reported successfully. AI found no matches yet — we will keep checking.',
        item: newItemPayload,
        ai_matches_found: matches.length,
        high_confidence_matches: highMatches.length
      });
    }

    // isLive() branch return (MySQL path)
    return res.status(201).json({
      success: true,
      message: 'Item reported successfully and processed by AI matching engine',
      item: newItemPayload
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


async function createClaim(req, res) {
  try {
    const { item_id, proof_description } = req.body;
    const claimantId = req.user.id;

    if (!item_id || !proof_description) {
      return res.status(400).json({ success: false, message: 'item_id and proof_description are required' });
    }

    let proof_image_url = null;
    if (req.file) {
      proof_image_url = `/uploads/${req.file.filename}`;
    }

    if (isLive()) {
      const result = await query(
        'INSERT INTO lost_found_claims (item_id, claimant_id, proof_description, proof_image_url, status) VALUES (?, ?, ?, ?, "pending")',
        [item_id, claimantId, proof_description, proof_image_url]
      );
      await query('UPDATE lost_found_items SET status = "claimed" WHERE id = ?', [item_id]);
      return res.status(201).json({ success: true, message: 'Claim submitted successfully', claim_id: result.insertId });
    } else {
      const newClaim = {
        id: memoryStore.lost_found_claims.length + 1,
        item_id: Number(item_id),
        claimant_id: claimantId,
        proof_description,
        proof_image_url,
        status: 'pending',
        admin_notes: null,
        created_at: new Date()
      };
      memoryStore.lost_found_claims.unshift(newClaim);

      const item = memoryStore.lost_found_items.find(i => i.id === Number(item_id));
      if (item) item.status = 'claimed';

      return res.status(201).json({ success: true, message: 'Claim submitted successfully', claim: newClaim });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateClaimStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status (approved, rejected, pending) is required' });
    }

    if (isLive()) {
      await query(
        'UPDATE lost_found_claims SET status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?',
        [status, admin_notes, id]
      );
      if (status === 'approved') {
        const claims = await query('SELECT item_id FROM lost_found_claims WHERE id = ?', [id]);
        if (claims.length > 0) {
          await query('UPDATE lost_found_items SET status = "resolved" WHERE id = ?', [claims[0].item_id]);
        }
      }
      return res.status(200).json({ success: true, message: `Claim marked as ${status}` });
    } else {
      const claim = memoryStore.lost_found_claims.find(c => c.id === Number(id));
      if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
      claim.status = status;
      if (admin_notes) claim.admin_notes = admin_notes;

      if (status === 'approved') {
        const item = memoryStore.lost_found_items.find(i => i.id === claim.item_id);
        if (item) item.status = 'resolved';
      }

      return res.status(200).json({ success: true, message: `Claim marked as ${status}`, claim });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getClaims(req, res) {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (isLive()) {
      let sql = `
        SELECT c.*, lf.title as item_title, lf.image_url as item_image, lf.category,
               u.name as claimant_name, u.email as claimant_email, u.phone as claimant_phone
        FROM lost_found_claims c
        JOIN lost_found_items lf ON c.item_id = lf.id
        JOIN users u ON c.claimant_id = u.id
      `;
      const params = [];
      if (!isAdmin) {
        sql += ' WHERE c.claimant_id = ?';
        params.push(userId);
      }
      sql += ' ORDER BY c.id DESC';
      const claims = await query(sql, params);
      return res.status(200).json({ success: true, data: claims });
    } else {
      let claims = memoryStore.lost_found_claims;
      if (!isAdmin) {
        claims = claims.filter(c => c.claimant_id === userId);
      }
      const enriched = claims.map(c => {
        const item = memoryStore.lost_found_items.find(i => i.id === c.item_id);
        const user = memoryStore.users.find(u => u.id === c.claimant_id);
        return {
          ...c,
          item_title: item ? item.title : 'Item',
          item_image: item ? item.image_url : null,
          category: item ? item.category : 'other',
          claimant_name: user ? user.name : 'Student',
          claimant_email: user ? user.email : '',
          claimant_phone: user ? user.phone : ''
        };
      });
      return res.status(200).json({ success: true, data: enriched });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  createClaim,
  updateClaimStatus,
  getClaims
};
