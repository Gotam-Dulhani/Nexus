const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { registerRules, loginRules, sendOtpRules, verifyOtpRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validators');

// Rate limiter for auth routes — max 10 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes' }
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & 2FA
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               role: { type: string, enum: [investor, entrepreneur] }
 */
router.post('/register', authLimiter, registerRules, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 */
router.post('/login', authLimiter, loginRules, login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset (mock)
 *     tags: [Auth]
 */
router.post('/forgot-password', authLimiter, forgotPasswordRules, forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 6 }
 */
router.post('/reset-password', authLimiter, resetPasswordRules, resetPassword);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP verification code to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 */
router.post('/send-otp', authLimiter, sendOtpRules, sendOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string, format: email }
 *               code: { type: string, minLength: 6, maxLength: 6 }
 */
router.post('/verify-otp', authLimiter, verifyOtpRules, verifyOTP);

module.exports = router;