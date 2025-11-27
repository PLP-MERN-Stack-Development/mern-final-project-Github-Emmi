const express = require('express');
const router = express.Router();
const {
  createZoomMeeting,
  getZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
  handleWebhook
} = require('../controllers/zoomController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes - Tutor/Admin only
router.post('/create', protect, authorize('tutor', 'admin'), createZoomMeeting);
router.get('/meeting/:meetingId', protect, getZoomMeeting);
router.put('/meeting/:meetingId', protect, authorize('tutor', 'admin'), updateZoomMeeting);
router.delete('/meeting/:meetingId', protect, authorize('tutor', 'admin'), deleteZoomMeeting);

// Webhook endpoint (public but should verify signature in production)
router.post('/webhook', handleWebhook);

module.exports = router;
