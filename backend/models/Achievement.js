const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['First Steps', 'Consistency', 'Progress', 'Engagement', 'Performance'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  target: {
    type: Number,
    default: 1
  },
  current: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements per user
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
