const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentSubmissions,
  getMySubmissions,
  getTutorAssignments,
  getTutorPendingSubmissions
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes - Tutor
router.get('/tutor/my-assignments', protect, authorize('tutor', 'admin'), getTutorAssignments);
router.get('/tutor/pending-submissions', protect, authorize('tutor', 'admin'), getTutorPendingSubmissions);
router.post('/', protect, authorize('tutor', 'admin'), createAssignment);
router.get('/:id/submissions', protect, authorize('tutor', 'admin'), getAssignmentSubmissions);
router.put('/submission/:id/grade', protect, authorize('tutor', 'admin'), gradeSubmission);

// Protected routes - Student
router.get('/my-submissions', protect, authorize('student'), getMySubmissions);
router.post('/:id/submit', protect, upload.array('files', 5), submitAssignment);

// Protected routes - All
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignment);

module.exports = router;
