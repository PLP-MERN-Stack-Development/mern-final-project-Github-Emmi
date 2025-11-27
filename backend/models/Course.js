const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD', 'EUR', 'GBP']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'AI/ML', 'DevOps', 'Design', 'Business', 'Other'],
    default: 'Other'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  syllabus: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['video', 'article', 'pdf', 'link', 'other']
      }
    }],
    order: Number
  }],
  schedule: [{
    zoomMeetingId: {
      type: String,
      required: true
    },
    topic: String,
    join_url: {
      type: String,
      required: true
    },
    start_url: String, // For host (tutor)
    startTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    },
    password: String,
    status: {
      type: String,
      enum: ['scheduled', 'started', 'ended', 'cancelled'],
      default: 'scheduled'
    },
    recordingUrl: String,
    transcriptUrl: String,
    summaryUrl: String
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom'
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [Number]
  }],
  maxStudents: {
    type: Number,
    default: 100
  },
  startDate: Date,
  endDate: Date,
  isPublished: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  tags: [String],
  ratings: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
  }
};

// Index for search optimization
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ tutorId: 1 });
courseSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Course', courseSchema);
