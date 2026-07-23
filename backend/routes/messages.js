const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getMessagesWithUser, sendMessage, getConversations } = require('../controllers/messageController');

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', protect, getConversations);

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Get messages with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/:userId', protect, getMessagesWithUser);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', protect, sendMessage);

module.exports = router;
