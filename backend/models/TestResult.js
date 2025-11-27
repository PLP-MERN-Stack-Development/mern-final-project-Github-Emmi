const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    answer: String,
    isCorrect: Boolean,
    marksAwarded: Number
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  },
  timeTaken: Number, // in minutes
  attemptNumber: {
    type: Number,
    default: 1
  },
  feedback: String
}, {
  timestamps: true
});

// Compound index
testResultSchema.index({ testId: 1, studentId: 1 });

module.exports = mongoose.model('TestResult', testResultSchema);
