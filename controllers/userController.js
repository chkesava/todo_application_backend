const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
