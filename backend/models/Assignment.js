const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an assignment title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide assignment description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructions: {
    type: String
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  maxScore: {
    type: Number,
    required: [true, 'Please provide maximum score'],
    min: [0, 'Score cannot be negative'],
    default: 100
  },
  files: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    cloudinaryId: String
  }],
  // Deprecated - kept for backwards compatibility
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionPenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  rubric: [{
    criterion: String,
    maxPoints: Number,
    description: String
  }]
}, {
  timestamps: true
});

// Index for querying
assignmentSchema.index({ courseId: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
