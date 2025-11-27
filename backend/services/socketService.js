const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');

let io;

module.exports = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join room
    socket.on('joinRoom', async ({ roomId, userId }) => {
      try {
        socket.join(roomId);
        socket.userId = userId;
        socket.currentRoom = roomId;

        console.log(`User ${userId} joined room ${roomId}`);

        // Update last read
        await ChatRoom.updateOne(
          { _id: roomId, 'participants.userId': userId },
          { $set: { 'participants.$.lastRead': Date.now() } }
        );

        // Send join notification to room
        socket.to(roomId).emit('userJoined', {
          userId,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leaveRoom', ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`User ${userId} left room ${roomId}`);

      socket.to(roomId).emit('userLeft', {
        userId,
        timestamp: Date.now()
      });
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        // Handle different data formats
        const roomId = data.roomId || data.room;
        const messageText = data.message || data.text;
        const from = data.from || socket.userId;
        const type = data.type || 'text';

        if (!roomId || !messageText || !from) {
          console.error('Invalid message data:', data);
          socket.emit('error', { message: 'Invalid message data. Required: roomId, message, from' });
          return;
        }

        // Save message to database
        const newMessage = await Message.create({
          roomId,
          from,
          message: messageText,
          type
        });

        await newMessage.populate('from', 'name avatarUrl');

        // Update chat room last message
        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage: {
            text: messageText,
            from,
            timestamp: Date.now()
          }
        });

        // Emit to all users in room
        io.to(roomId).emit('newMessage', newMessage);

        // Emit notification to offline users
        const room = await ChatRoom.findById(roomId);
        const offlineParticipants = room.participants.filter(
          p => p.userId.toString() !== from.toString()
        );

        offlineParticipants.forEach(participant => {
          io.to(participant.userId.toString()).emit('newNotification', {
            type: 'new_message',
            title: 'New Message',
            message: `New message in ${room.name}`,
            roomId
          });
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('userTyping', { userId, userName });
    });

    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userStoppedTyping', { userId });
    });

    // Mark message as read
    socket.on('markAsRead', async ({ messageId, userId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: {
            readBy: {
              userId,
              readAt: Date.now()
            }
          }
        });

        // Notify sender
        const message = await Message.findById(messageId);
        io.to(message.roomId).emit('messageRead', {
          messageId,
          userId
        });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // WebRTC signaling for video calls
    socket.on('signalOffer', ({ toSocket, offer }) => {
      io.to(toSocket).emit('receiveOffer', {
        from: socket.id,
        offer
      });
    });

    socket.on('signalAnswer', ({ toSocket, answer }) => {
      io.to(toSocket).emit('receiveAnswer', {
        from: socket.id,
        answer
      });
    });

    socket.on('iceCandidate', ({ toSocket, candidate }) => {
      io.to(toSocket).emit('receiveIceCandidate', {
        from: socket.id,
        candidate
      });
    });

    // Community feed real-time events
    socket.on('newPost', (post) => {
      io.emit('postCreated', post);
    });

    socket.on('postLiked', ({ postId, userId }) => {
      io.emit('postLikeUpdated', { postId, userId });
    });

    socket.on('newComment', ({ postId, comment }) => {
      io.emit('commentAdded', { postId, comment });
    });

    // Notification events
    socket.on('joinNotifications', (userId) => {
      socket.join(`notifications:${userId}`);
      console.log(`User ${userId} joined notifications channel`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      
      if (socket.currentRoom && socket.userId) {
        socket.to(socket.currentRoom).emit('userLeft', {
          userId: socket.userId,
          timestamp: Date.now()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Export function to send notification to specific user
module.exports.sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`notifications:${userId}`).emit('newNotification', notification);
  }
};
