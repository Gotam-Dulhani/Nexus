const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { depositRules, withdrawRules, transferRules } = require('../middleware/validators');
const {
  getBalance,
  deposit,
  confirmDeposit,
  withdraw,
  transfer,
  getHistory
} = require('../controllers/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Mock payment sandbox — deposit, withdraw, transfer
 */

/**
 * @swagger
 * /api/payments/balance:
 *   get:
 *     summary: Get user wallet balance
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Balance returned
 */
router.get('/balance', protect, getBalance);

/**
 * @swagger
 * /api/payments/deposit:
 *   post:
 *     summary: Deposit funds into wallet
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, minimum: 0.01 }
 *               description: { type: string }
 */
router.post('/deposit', protect, depositRules, deposit);

/**
 * @swagger
 * /api/payments/deposit/confirm:
 *   post:
 *     summary: Confirm Stripe Deposit
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [transactionId, paymentIntentId]
 *             properties:
 *               transactionId: { type: string }
 *               paymentIntentId: { type: string }
 */
router.post('/deposit/confirm', protect, confirmDeposit);

/**
 * @swagger
 * /api/payments/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, minimum: 0.01 }
 *               description: { type: string }
 */
router.post('/withdraw', protect, withdrawRules, withdraw);

/**
 * @swagger
 * /api/payments/transfer:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toUserId, amount]
 *             properties:
 *               toUserId: { type: string }
 *               amount: { type: number, minimum: 0.01 }
 *               description: { type: string }
 */
router.post('/transfer', protect, transferRules, transfer);

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get transaction history
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/history', protect, getHistory);

module.exports = router;
