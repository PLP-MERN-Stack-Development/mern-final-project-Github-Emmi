const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentText: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post cannot exceed 5000 characters']
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    cloudinaryId: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  hashtags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  visibility: {
    type: String,
    enum: ['public', 'course', 'private'],
    default: 'public'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  reportCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  moderationReason: {
    type: String,
    maxlength: [500, 'Moderation reason cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for feed queries
postSchema.index({ createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ courseId: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

module.exports = mongoose.model('Post', postSchema);
