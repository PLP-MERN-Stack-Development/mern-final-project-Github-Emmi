const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseSchedule,
  addRating,
  approveCourse,
  rejectCourse,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getJoinUrl,
  getStartUrl
} = require('../controllers/courseController');
const { protect, authorize, verifiedTutorOnly, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes - Tutor only
router.post('/', protect, authorize('tutor', 'admin'), verifiedTutorOnly, createCourse);
router.put('/:id', protect, authorize('tutor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('tutor', 'admin'), deleteCourse);

// Schedule management - Tutor only
router.post('/:id/schedule', protect, authorize('tutor', 'admin'), addSchedule);
router.put('/:id/schedule/:scheduleId', protect, authorize('tutor', 'admin'), updateSchedule);
router.delete('/:id/schedule/:scheduleId', protect, authorize('tutor', 'admin'), deleteSchedule);

// Zoom meeting URLs
router.get('/:id/schedule/:scheduleId/join', protect, getJoinUrl); // Students
router.get('/:id/schedule/:scheduleId/start', protect, authorize('tutor', 'admin'), getStartUrl); // Tutors

// Protected routes - Admin only
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveCourse);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectCourse);

// Protected routes - Student
router.post('/:id/enroll', protect, enrollInCourse);
router.get('/:id/schedule', protect, getCourseSchedule);
router.post('/:id/rating', protect, authorize('student'), addRating);

module.exports = router;
