const OTP = require('../models/OTP');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create a transporter — uses Ethereal (fake SMTP) for mock, or real SMTP if configured
const createTransporter = async () => {
  // If real SMTP is configured, use it
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Otherwise use Ethereal test account (mock)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
};

// POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DB (invalidate old ones)
    await OTP.deleteMany({ user: user._id, used: false });
    await OTP.create({ user: user._id, code, expiresAt });

    // Send email
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: '"Nexus Platform" <noreply@nexus.com>',
      to: email,
      subject: 'Your Nexus Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Nexus Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">This code expires in 10 minutes.</p>
        </div>
      `
    });

    // For Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[OTP] Email preview:', previewUrl || 'sent via real SMTP');

    res.json({
      success: true,
      message: 'OTP sent to your email',
      ...(previewUrl ? { previewUrl } : {}) // include preview URL in dev mode
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = await OTP.findOne({
      user: user._id,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
