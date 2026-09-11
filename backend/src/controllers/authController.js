const bcrypt = require('bcryptjs');
const { signToken } = require('../config/jwt');
const { isLive, query, memoryStore } = require('../config/db');

async function login(req, res) {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (Email, Student ID, Driver ID, or Phone) and password are required'
      });
    }

    let user = null;

    if (isLive()) {
      const sql = `
        SELECT * FROM users 
        WHERE (email = ? OR phone = ? OR student_id = ? OR driver_id = ?)
        ${role ? 'AND role = ?' : ''}
        LIMIT 1
      `;
      const params = role ? [identifier, identifier, identifier, identifier, role] : [identifier, identifier, identifier, identifier];
      const rows = await query(sql, params);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = memoryStore.users.find(u => {
        const matchesId = u.email === identifier ||
          u.phone === identifier ||
          (u.student_id && u.student_id.toLowerCase() === identifier.toLowerCase()) ||
          (u.driver_id && u.driver_id.toLowerCase() === identifier.toLowerCase());
        return role ? matchesId && u.role === role : matchesId;
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or user not registered'
      });
    }

    // Password verification:
    // 1. Demo passwords
    // 2. Student Date of Birth (DDMMYYYY) if set
    // 3. Bcrypt comparison
    let isPasswordValid = false;
    if (password === 'password123' || password === 'admin123' || password === 'student123' || password === 'driver123') {
      isPasswordValid = true;
    } else if (user.dob && password === user.dob) {
      isPasswordValid = true;
    } else if (user.password_hash) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      } catch {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. For students, default password is Date of Birth (DDMMYYYY).'
      });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      student_id: user.student_id,
      driver_id: user.driver_id,
      avatar_url: user.avatar_url,
      dob: user.dob || null,
      pickup_stop: user.pickup_stop || null,
      assigned_route_id: user.assigned_route_id || null,
      assigned_route_name: user.assigned_route_name || null,
      pass_number: user.pass_number || null,
      transport_fee_status: user.transport_fee_status || 'paid'
    };

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during authentication', error: err.message });
  }
}

async function getMe(req, res) {
  try {
    const userId = req.user.id;
    let fullUser = null;

    if (isLive()) {
      const rows = await query('SELECT * FROM users WHERE id = ?', [userId]);
      if (rows && rows.length > 0) fullUser = rows[0];
    } else {
      fullUser = memoryStore.users.find(u => u.id === userId);
    }

    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userPayload = {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      phone: fullUser.phone,
      role: fullUser.role,
      student_id: fullUser.student_id,
      driver_id: fullUser.driver_id,
      avatar_url: fullUser.avatar_url,
      dob: fullUser.dob || null,
      pickup_stop: fullUser.pickup_stop || null,
      assigned_route_id: fullUser.assigned_route_id || null,
      assigned_route_name: fullUser.assigned_route_name || null,
      pass_number: fullUser.pass_number || null,
      transport_fee_status: fullUser.transport_fee_status || 'paid'
    };

    return res.status(200).json({
      success: true,
      user: userPayload
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    let user = null;
    if (isLive()) {
      const rows = await query('SELECT * FROM users WHERE id = ?', [userId]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = memoryStore.users.find(u => u.id === userId);
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify current password (if provided)
    if (current_password) {
      let valid = (current_password === 'password123' || (user.dob && current_password === user.dob));
      if (!valid && user.password_hash) {
        try { valid = await bcrypt.compare(current_password, user.password_hash); } catch {}
      }
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    if (isLive()) {
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);
    } else {
      user.password_hash = password_hash;
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateFcmToken(req, res) {
  try {
    const { fcm_token } = req.body;
    const userId = req.user.id;

    if (isLive()) {
      await query('UPDATE users SET fcm_token = ? WHERE id = ?', [fcm_token, userId]);
    } else {
      const u = memoryStore.users.find(usr => usr.id === userId);
      if (u) u.fcm_token = fcm_token;
    }

    return res.status(200).json({ success: true, message: 'FCM Token registered successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  login,
  getMe,
  changePassword,
  updateFcmToken
};

