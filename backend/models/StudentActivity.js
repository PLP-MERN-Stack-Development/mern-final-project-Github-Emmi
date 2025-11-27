const mongoose = require('mongoose');

const studentActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'course_enrolled',
      'course_completed',
      'assignment_submitted',
      'assignment_graded',
      'post_created',
      'comment_created',
      'login',
      'achievement_unlocked',
      'level_up'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '📝'
  },
  metadata: {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    achievementId: String,
    score: Number,
    xpGained: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying by user and date
studentActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('StudentActivity', studentActivitySchema);
