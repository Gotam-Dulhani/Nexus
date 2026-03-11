const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  let { name, email, password, role } = req.body;
  email = email.toLowerCase();
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    await Profile.create({ user: user._id });

    // ✅ No token — just success message
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email', email);
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch for email', email);
      return res.status(400).json({ message: 'Invalid credentials: Password mismatch' });
    }

    // Fetch the attached profile to get the avatarUrl
    const profile = await Profile.findOne({ user: user._id });

    const token = generateToken(user);
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email, 
        role: user.role, 
        avatarUrl: profile?.avatar || null 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// POST /api/auth/forgot-password (mock)
exports.forgotPassword = async (req, res) => {
  res.json({ success: true, message: 'Password reset email sent.' });
};

// POST /api/auth/reset-password (mock)
exports.resetPassword = async (req, res) => {
  res.json({ success: true, message: 'Password reset successfully.' });
};