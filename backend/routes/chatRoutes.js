const express = require('express');
const router = express.Router();
const {
  getChatRooms,
  getRoomMessages,
  createDirectRoom,
  deleteMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.get('/rooms', protect, getChatRooms);
router.get('/rooms/:roomId/messages', protect, getRoomMessages);
router.post('/rooms/direct', protect, createDirectRoom);
router.delete('/messages/:messageId', protect, deleteMessage);

module.exports = router;
