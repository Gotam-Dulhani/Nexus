const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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


// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a reset email was sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetHash;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    try {
      let transporter;
      if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email', port: 587, secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
      }

      await transporter.sendMail({
        from: '"Nexus Platform" <noreply@nexus.com>',
        to: user.email,
        subject: 'Nexus Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1;">Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
            <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('[ForgotPassword] Email send failed:', emailErr.message);
    }

    res.json({ success: true, message: 'If an account exists, a reset email was sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const resetHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetHash,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};