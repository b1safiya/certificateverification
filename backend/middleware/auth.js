const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains id and role
    // optionally attach full user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user.role = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
