const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllCourses,
  approveCourse,
  rejectCourse,
  assignTutorToCourse,
  deleteCourse,
  getAllAssignments,
  deleteAssignment,
  getAllPosts,
  flagPost,
  getAllPayments,
  issueRefund,
  getPlatformOverview,
  getUserGrowth,
  getRevenueAnalytics,
  getEngagementStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect, authorize('admin', 'superadmin'));

// ==================== USER MANAGEMENT ====================
router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

// ==================== COURSE MANAGEMENT ====================
router.route('/courses')
  .get(getAllCourses);

router.route('/courses/:id')
  .delete(deleteCourse);

router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);
router.patch('/courses/:id/assign', assignTutorToCourse);

// ==================== ASSIGNMENT OVERSIGHT ====================
router.route('/assignments')
  .get(getAllAssignments);

router.route('/assignments/:id')
  .delete(deleteAssignment);

// ==================== FEED MODERATION ====================
router.get('/feeds', getAllPosts);
router.patch('/feeds/:id/flag', flagPost);

// ==================== PAYMENTS ====================
router.get('/payments', getAllPayments);
router.patch('/payments/:id/refund', issueRefund);

// ==================== ANALYTICS ====================
router.get('/analytics/overview', getPlatformOverview);
router.get('/analytics/user-growth', getUserGrowth);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/engagement', getEngagementStats);

module.exports = router;
