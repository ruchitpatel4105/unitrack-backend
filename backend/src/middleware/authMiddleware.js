const { verifyToken } = require('../config/jwt');
const { isLive, query, memoryStore } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In memory fallback mode, assign default student so reporting never breaks
      if (!isLive()) {
        req.user = memoryStore.users.find(u => u.role === 'student') || { id: 2, role: 'student', name: 'Student Member', email: '2403051057034@paruluniversity.ac.in' };
        return next();
      }
      return res.status(401).json({ success: false, message: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    let decoded = null;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      if (!isLive()) {
        req.user = memoryStore.users.find(u => u.role === 'student') || { id: 2, role: 'student', name: 'Student Member', email: '2403051057034@paruluniversity.ac.in' };
        return next();
      }
      return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
    }

    let user = null;
    if (isLive()) {
      const rows = await query('SELECT id, role, name, email, phone, student_id, driver_id, avatar_url FROM users WHERE id = ?', [decoded.id]);
      if (rows && rows.length > 0) user = rows[0];
    } else {
      user = memoryStore.users.find(u => u.id === decoded.id);
      if (!user) {
        // Automatically restore user from verified token in memory store after server restart!
        user = {
          id: decoded.id || 2,
          role: decoded.role || 'student',
          name: decoded.name || 'University Member',
          email: decoded.email || '2403051057034@paruluniversity.ac.in',
          phone: '',
          student_id: decoded.student_id || '2403051057034'
        };
        memoryStore.users.push(user);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session revoked' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      student_id: user.student_id,
      driver_id: user.driver_id,
      avatar_url: user.avatar_url
    };

    next();
  } catch (err) {
    if (!isLive()) {
      req.user = memoryStore.users.find(u => u.role === 'student') || { id: 2, role: 'student', name: 'Student Member', email: '2403051057034@paruluniversity.ac.in' };
      return next();
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};
