const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userFrom = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(id);
};

exports.protect = async (req, res, next) => {
  try {
    const user = await userFrom(req);
    if (!user) return res.status(401).json({ message: 'Please log in to continue' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please log in again' }); }
};

// For public routes that behave differently for admins
exports.optionalAuth = async (req, _res, next) => {
  try { req.user = await userFrom(req); } catch { req.user = null; }
  next();
};

exports.adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
