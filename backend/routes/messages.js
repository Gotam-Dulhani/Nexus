const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getMessagesWithUser, sendMessage, getConversations } = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessagesWithUser);
router.post('/', protect, sendMessage);

module.exports = router;
