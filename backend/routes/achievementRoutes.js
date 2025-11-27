const express = require('express');
const router = express.Router();
const {
  getStudentAchievements,
  getStudentStats,
  getLearningAnalytics,
  getActivityTimeline,
  checkAchievements
} = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student achievement routes
router.get('/student/:userId', getStudentAchievements);
router.get('/stats/:userId', getStudentStats);
router.get('/analytics/:userId', getLearningAnalytics);
router.get('/activity/:userId', getActivityTimeline);

// Internal route for checking achievements (can be called by other controllers)
router.post('/check/:userId', checkAchievements);

module.exports = router;
