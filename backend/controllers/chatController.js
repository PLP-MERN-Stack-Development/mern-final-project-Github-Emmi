const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

// @desc    Get all chat rooms for user
// @route   GET /api/chat/rooms
// @access  Private
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      'participants.userId': req.user.id,
      isActive: true
    })
      .populate('participants.userId', 'name avatarUrl')
      .populate('courseId', 'title thumbnail')
      .populate('lastMessage.from', 'name')
      .sort('-lastMessage.timestamp')
      .lean();

    // Add unread count for each room
    for (let room of chatRooms) {
      const participant = room.participants.find(
        p => p.userId._id.toString() === req.user.id
      );
      
      if (participant) {
        const unreadCount = await Message.countDocuments({
          roomId: room._id,
          createdAt: { $gt: participant.lastRead },
          from: { $ne: req.user.id }
        });
        room.unreadCount = unreadCount;
      }
    }

    res.status(200).json({
      success: true,
      count: chatRooms.length,
      data: chatRooms
    });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat rooms',
      error: error.message
    });
  }
};

// @desc    Get messages for a room
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    const isParticipant = room.participants.some(
      p => p.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    // Get messages
    const messages = await Message.find({
      roomId,
      isDeleted: false
    })
      .populate('from', 'name avatarUrl')
      .populate('replyTo', 'message from')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Message.countDocuments({ roomId, isDeleted: false });

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Create direct chat room
// @route   POST /api/chat/rooms/direct
// @access  Private
exports.createDirectRoom = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide participant ID'
      });
    }

    // Check if room already exists
    const existingRoom = await ChatRoom.findOne({
      type: 'direct',
      'participants.userId': { $all: [req.user.id, participantId] }
    });

    if (existingRoom) {
      return res.status(200).json({
        success: true,
        data: existingRoom
      });
    }

    // Create new room
    const User = require('../models/User');
    const participant = await User.findById(participantId);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const chatRoom = await ChatRoom.create({
      name: `${req.user.name} & ${participant.name}`,
      type: 'direct',
      participants: [
        { userId: req.user.id, role: 'member' },
        { userId: participantId, role: 'member' }
      ]
    });

    await chatRoom.populate('participants.userId', 'name avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Chat room created',
      data: chatRoom
    });
  } catch (error) {
    console.error('Create direct room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat room',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.from.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = Date.now();
    message.message = 'This message has been deleted';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};
