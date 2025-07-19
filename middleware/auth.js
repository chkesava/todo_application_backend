const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  let token = req.header('Authorization');
  if (!token || !token.startsWith('Bearer ')) return res.status(401).json({ message: 'No token, auth denied' });

  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) throw 'User not found';
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = auth;
