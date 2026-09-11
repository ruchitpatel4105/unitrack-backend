const { isLive, query, memoryStore } = require('../config/db');

async function getUserNotifications(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isLive()) {
      const sql = `
        SELECT * FROM notifications 
        WHERE user_id = ? OR role IN (?, 'all')
        ORDER BY id DESC
        LIMIT 50
      `;
      const notifs = await query(sql, [userId, userRole]);
      return res.status(200).json({ success: true, data: notifs });
    } else {
      const list = memoryStore.notifications
        .filter(n => n.user_id === userId || n.role === userRole || n.role === 'all')
        .sort((a, b) => b.id - a.id);
      return res.status(200).json({ success: true, data: list });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    } else {
      const n = memoryStore.notifications.find(item => item.id === Number(id));
      if (n) n.is_read = 1;
    }
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function broadcastNotification(req, res) {
  try {
    const { title, message, role = 'all', type = 'general' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const notif = {
      user_id: req.user.id,
      role,
      title,
      message,
      type,
      is_read: 0,
      metadata: null,
      created_at: new Date()
    };

    if (isLive()) {
      const result = await query(
        'INSERT INTO notifications (user_id, role, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [req.user.id, role, title, message, type]
      );
      notif.id = result.insertId;
    } else {
      notif.id = memoryStore.notifications.length + 1;
      memoryStore.notifications.unshift(notif);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('notification:broadcast', notif);
    }

    return res.status(201).json({ success: true, message: 'Announcement dispatched', notification: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getUserNotifications,
  markAsRead,
  broadcastNotification
};
