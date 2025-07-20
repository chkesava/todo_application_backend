const User = require('../models/User');
const jwt = require('jsonwebtoken');

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = crypto.createHash("sha256").update(otp).digest("hex");
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  const html = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP is: <strong>${otp}</strong></p>
    <p>This OTP is valid for 10 minutes. Please do not share it.</p>
  `;
  await sendEmail(user.email, "Your OTP to reset password", html);

  res.json({ message: "OTP sent to email." });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "All fields are required." });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (
    user.resetOtp !== hashedOtp ||
    !user.resetOtpExpires ||
    user.resetOtpExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  user.password = newPassword; // 🛡 hash with bcrypt in production!
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  await user.save();

  res.json({ message: "Password reset successful." });
};
