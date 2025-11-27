const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['course', 'direct', 'group'],
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  description: String,
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    text: String,
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  }
}, {
  timestamps: true
});

// Index for querying
chatRoomSchema.index({ 'participants.userId': 1 });
chatRoomSchema.index({ courseId: 1 });
chatRoomSchema.index({ type: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
