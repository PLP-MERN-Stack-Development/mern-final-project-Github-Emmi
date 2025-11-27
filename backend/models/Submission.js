const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    cloudinaryId: String
  }],
  text: {
    type: String,
    maxlength: [5000, 'Submission text cannot exceed 5000 characters']
  },
  score: {
    type: Number,
    min: 0,
    default: null
  },
  feedback: {
    type: String,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: Date,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  aiPreGrade: {
    score: Number,
    feedback: String,
    confidence: Number
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ assignmentId: 1, studentId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
