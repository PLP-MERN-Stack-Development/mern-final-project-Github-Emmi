const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getResourceRecommendations,
  analyzePerformance,
  generateStudyPlan,
  askQuestion,
  preGradeSubmission
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.post('/recommend', protect, getRecommendations);
router.post('/resources', protect, getResourceRecommendations);
router.get('/performance-analysis/:courseId', protect, analyzePerformance);
router.post('/study-plan', protect, generateStudyPlan);
router.post('/ask', protect, askQuestion);

// Tutor only
router.post('/pre-grade/:submissionId', protect, authorize('tutor', 'admin'), preGradeSubmission);

module.exports = router;
