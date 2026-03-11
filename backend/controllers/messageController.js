const Message = require('../models/Message');

// GET /api/messages/:userId (messages with a specific user)
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const mongoose = require('mongoose');
    
    const message = new Message({
      sender: new mongoose.Types.ObjectId(req.user.id),
      receiver: new mongoose.Types.ObjectId(receiverId),
      content
    });
    
    await message.save();
    console.log(`[Message] Saved message from ${req.user.id} to ${receiverId}`);
    res.status(201).json(message);
  } catch (error) {
    console.error('[Message] send error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const mongoose = require('mongoose');
    
    let diag = { userId, standardQuery: 0, objectIdFallback: 0, manualScan: 0 };

    // 1. Try string-based query
    let messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).sort({ createdAt: -1 }).lean();
    diag.standardQuery = messages.length;

    // 2. Try ObjectId fallback
    if (messages.length === 0 && mongoose.Types.ObjectId.isValid(userId)) {
      const uID = new mongoose.Types.ObjectId(userId);
      messages = await Message.find({
        $or: [
          { sender: uID },
          { receiver: uID }
        ]
      }).sort({ createdAt: -1 }).lean();
      diag.objectIdFallback = messages.length;
    }

    // 3. Final manual scan fallback
    if (messages.length === 0) {
      const allMessages = await Message.find({}).sort({ createdAt: -1 }).limit(1000).lean();
      messages = allMessages.filter(m => 
        m.sender.toString() === userId.toString() || 
        m.receiver.toString() === userId.toString()
      );
      diag.manualScan = messages.length;
      diag.dbTotal = allMessages.length;
    }

    // Grouping
    const conversationMap = new Map();
    for (const msg of messages) {
      const s = msg.sender.toString();
      const r = msg.receiver.toString();
      const partnerId = s === userId.toString() ? r : s;
        
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          _id: partnerId,
          lastMessage: msg
        });
      }
    }

    const grouped = Array.from(conversationMap.values());
    diag.groupedCount = grouped.length;

    const result = await Promise.all(grouped.map(async (conv) => {
      const partner = await User.findById(conv._id).select('name avatarUrl role').lean();
      return {
        ...conv,
        user: partner || { _id: conv._id, name: 'Unknown User', isPlaceholder: true }
      };
    }));

    res.json({
      conversations: result,
      diagnostic: diag
    });
  } catch (error) {
    console.error('[Message-Diagnostic] Fatal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
