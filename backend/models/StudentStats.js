const mongoose = require('mongoose');

const studentStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivityDate: {
    type: Date
  },
  totalStudyHours: {
    type: Number,
    default: 0,
    min: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCourses: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalAssignments: {
    type: Number,
    default: 0,
    min: 0
  },
  completedAssignments: {
    type: Number,
    default: 0,
    min: 0
  },
  communityEngagement: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPosts: {
    type: Number,
    default: 0,
    min: 0
  },
  totalComments: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate XP needed for next level (exponential growth)
studentStatsSchema.methods.getXpForNextLevel = function() {
  return Math.floor(1000 * Math.pow(1.5, this.level - 1));
};

// Calculate XP to next level
studentStatsSchema.methods.getXpToNextLevel = function() {
  return this.getXpForNextLevel() - this.xp;
};

// Add XP and check for level up
studentStatsSchema.methods.addXp = function(amount) {
  this.xp += amount;
  
  // Check for level up
  let leveledUp = false;
  while (this.xp >= this.getXpForNextLevel()) {
    this.level += 1;
    leveledUp = true;
  }
  
  return leveledUp;
};

// Update streak based on last activity
studentStatsSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.lastActivityDate;
  
  if (!lastActivity) {
    // First activity
    this.currentStreak = 1;
    this.longestStreak = 1;
  } else {
    const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity === 0) {
      // Same day, no change
      return;
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day, increment streak
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      // Streak broken
      this.currentStreak = 1;
    }
  }
  
  this.lastActivityDate = now;
};

module.exports = mongoose.model('StudentStats', studentStatsSchema);
