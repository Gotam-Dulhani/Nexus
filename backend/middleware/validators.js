const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth Validators ──────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['investor', 'entrepreneur']).withMessage('Role must be investor or entrepreneur'),
  validate
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// ── Meeting Validators ───────────────────────────────────────────
const createMeetingRules = [
  body('attendeeId').notEmpty().withMessage('Attendee ID is required')
    .isMongoId().withMessage('Invalid attendee ID'),
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title too long'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  validate
];

// ── Payment Validators ───────────────────────────────────────────
const depositRules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  validate
];

const withdrawRules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  validate
];

const transferRules = [
  body('toUserId').notEmpty().withMessage('Recipient ID is required')
    .isMongoId().withMessage('Invalid recipient ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  validate
];

// ── OTP Validators ───────────────────────────────────────────────
const sendOtpRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate
];

const verifyOtpRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate
];

// ── Password Reset Validators ────────────────────────────────────
const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  validate
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

module.exports = {
  registerRules,
  loginRules,
  createMeetingRules,
  depositRules,
  withdrawRules,
  transferRules,
  sendOtpRules,
  verifyOtpRules,
  forgotPasswordRules,
  resetPasswordRules
};
