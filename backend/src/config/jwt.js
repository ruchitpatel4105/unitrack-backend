const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unitrack_super_secret_jwt_key_2026_production';
const JWT_EXPIRES_IN = '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  signToken,
  verifyToken
};
