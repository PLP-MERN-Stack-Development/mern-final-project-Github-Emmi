const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide test duration'],
    min: 1
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      required: true
    },
    options: [String], // For multiple-choice
    correctAnswer: String,
    marks: {
      type: Number,
      required: true,
      min: 0
    },
    explanation: String,
    order: Number
  }],
  startDate: Date,
  endDate: Date,
  attempts: {
    type: Number,
    default: 1,
    min: 1
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

testSchema.index({ courseId: 1 });

module.exports = mongoose.model('Test', testSchema);
