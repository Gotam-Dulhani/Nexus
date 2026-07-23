const Message = require('./models/Message');
const mongoose = require('mongoose');

module.exports = (io) => {
  // Map of userId → Set of socket IDs
  const userSockets = new Map();
  // Map of roomId → array of participants
  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Register user
    socket.on('register', (userId) => {
      if (!userId) return;
      console.log(`[Socket] Registering user: ${userId}`);
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);
      socket.userId = userId;
      console.log(`[Socket] Total registered users: ${userSockets.size}. Sockets for ${userId}: ${userSockets.get(userId).size}`);
    });

    // Real-time Messaging Notification
    socket.on('send-message', ({ receiverId, message }) => {
      console.log(`[Socket] Message from ${socket.userId} to ${receiverId}`);
      const receiverSockets = userSockets.get(receiverId);
      if (receiverSockets) {
        console.log(`[Socket] Found ${receiverSockets.size} sockets for receiver ${receiverId}`);
        receiverSockets.forEach(id => {
          io.to(id).emit('new-message', message);
        });
      } else {
        console.warn(`[Socket] Receiver ${receiverId} is offline (no sockets found)`);
      }
    });

    // Call Signaling (Ringing)
    socket.on('call-user', ({ targetUserId, callerName, callerAvatar, type, roomId }) => {
      console.log(`[Socket] ${type} Call: ${callerName} (${socket.userId}) -> ${targetUserId} in room ${roomId}`);
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        console.log(`[Socket] Found ${targetSockets.size} sockets for target ${targetUserId}`);
        targetSockets.forEach(id => {
          io.to(id).emit('incoming-call', {
            from: socket.userId,
            callerName,
            callerAvatar,
            type,
            roomId
          });
        });
      } else {
        console.warn(`[Socket] Target ${targetUserId} is offline`);
        
        // Log as missed call
        const missedCall = new Message({
          sender: socket.userId,
          receiver: targetUserId,
          content: `Missed ${type} call`,
          type: 'call',
          subType: type,
          callStatus: 'missed'
        });
        missedCall.save().then(msg => {
           console.log('[Socket] Missed call logged (offline)');
           // Notify caller
           socket.emit('new-message', msg);
        });

        socket.emit('call-error', { message: 'User is offline' });
      }
    });

    socket.on('accept-call', ({ targetUserId, roomId }) => {
      const targetSockets = userSockets.get(targetUserId);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io.to(id).emit('call-accepted', { roomId });
        });
      }
    });

    socket.on('reject-call', ({ targetUserId, type }) => {
      const targetSockets = userSockets.get(targetUserId);
      
      // Log as missed call on target's side
      const rejectedCall = new Message({
        sender: targetUserId, // The one who rejected is the 'sender' of the event effectively
        receiver: socket.userId,
        content: `Rejected ${type || 'call'}`,
        type: 'call',
        subType: type || 'video',
        callStatus: 'missed' // Or 'rejected'
      });
      
      rejectedCall.save().then(msg => {
         console.log('[Socket] Missed call logged (rejected)');
         // Notify both
         const callerSockets = userSockets.get(targetUserId);
         if (callerSockets) callerSockets.forEach(id => io.to(id).emit('new-message', msg));
         
         const rejecterSockets = userSockets.get(socket.userId);
         if (rejecterSockets) rejecterSockets.forEach(id => io.to(id).emit('new-message', msg));
      });

      if (targetSockets) {
        targetSockets.forEach(id => {
          io.to(id).emit('call-rejected');
        });
      }
    });

    // WebRTC Signaling
    socket.on('join-room', ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      if (!rooms[roomId]) rooms[roomId] = [];
      
      // Notify others
      socket.to(roomId).emit('user-joined', { socketId: socket.id, userId, userName });
      
      // Send current users to the joiner
      socket.emit('room-users', rooms[roomId]);
      
      rooms[roomId].push({ socketId: socket.id, userId, userName });
      console.log(`[Socket] ${userName} joined room ${roomId}`);
    });

    socket.on('offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('toggle-media', ({ roomId, userId, mediaType, enabled }) => {
      socket.to(roomId).emit('media-toggled', { socketId: socket.id, userId, mediaType, enabled });
    });

    socket.on('end-call', ({ roomId }) => {
      socket.to(roomId).emit('call-ended', { socketId: socket.id, userId: socket.userId });
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        userSockets.get(socket.userId).delete(socket.id);
        if (userSockets.get(socket.userId).size === 0) {
          userSockets.delete(socket.userId);
        }
      }

      const roomId = socket.roomId;
      if (roomId && rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(u => u.socketId !== socket.id);
        if (rooms[roomId].length === 0) delete rooms[roomId];
        socket.to(roomId).emit('user-left', { socketId: socket.id });
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};
