const Course = require('../models/Course');
const zoomService = require('../services/zoomService');
const Notification = require('../models/Notification');
const { sendClassReminderEmail } = require('../utils/emailService');

// @desc    Create Zoom meeting for a course
// @route   POST /api/zoom/create
// @access  Private (Tutor/Admin)
exports.createZoomMeeting = async (req, res) => {
  try {
    const { courseId, topic, startTime, duration, agenda, autoRecording } = req.body;

    // Validation
    if (!courseId || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId and startTime'
      });
    }

    // Get course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create meetings for this course'
      });
    }

    // Create Zoom meeting
    const zoomMeeting = await zoomService.createMeeting({
      topic: topic || `${course.title} - Class Session`,
      startTime: new Date(startTime).toISOString(),
      duration: duration || 60,
      agenda: agenda || '',
      autoRecording: autoRecording || 'none'
    });

    // Add to course schedule
    course.schedule.push({
      zoomMeetingId: zoomMeeting.meetingId.toString(),
      topic: zoomMeeting.topic,
      join_url: zoomMeeting.join_url,
      start_url: zoomMeeting.start_url,
      startTime: zoomMeeting.startTime,
      duration: zoomMeeting.duration,
      password: zoomMeeting.password,
      status: 'scheduled'
    });

    await course.save();

    // Notify enrolled students
    const notifications = course.enrolledStudents.map(student => ({
      userId: student.studentId,
      type: 'class_scheduled',
      title: 'New Class Scheduled',
      message: `A new class has been scheduled for ${course.title}`,
      metadata: {
        courseId: course._id
      },
      priority: 'high'
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Zoom meeting created and scheduled successfully',
      data: {
        meetingId: zoomMeeting.meetingId,
        topic: zoomMeeting.topic,
        join_url: zoomMeeting.join_url,
        startTime: zoomMeeting.startTime,
        duration: zoomMeeting.duration
      }
    });
  } catch (error) {
    console.error('Create Zoom meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Zoom meeting',
      error: error.message
    });
  }
};

// @desc    Get Zoom meeting details
// @route   GET /api/zoom/meeting/:meetingId
// @access  Private
exports.getZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await zoomService.getMeeting(meetingId);

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get Zoom meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting details',
      error: error.message
    });
  }
};

// @desc    Update Zoom meeting
// @route   PUT /api/zoom/meeting/:meetingId
// @access  Private (Tutor/Admin)
exports.updateZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const updates = req.body;

    const result = await zoomService.updateMeeting(meetingId, updates);

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update Zoom meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meeting',
      error: error.message
    });
  }
};

// @desc    Delete Zoom meeting
// @route   DELETE /api/zoom/meeting/:meetingId
// @access  Private (Tutor/Admin)
exports.deleteZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    await zoomService.deleteMeeting(meetingId);

    // Also remove from course schedule
    await Course.updateMany(
      { 'schedule.zoomMeetingId': meetingId },
      { $pull: { schedule: { zoomMeetingId: meetingId } } }
    );

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete Zoom meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meeting',
      error: error.message
    });
  }
};

// @desc    Handle Zoom webhooks
// @route   POST /api/zoom/webhook
// @access  Public (but should verify Zoom signature)
exports.handleWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log('Zoom webhook received:', event);

    switch (event) {
      case 'meeting.started':
        await handleMeetingStarted(payload);
        break;
      case 'meeting.ended':
        await handleMeetingEnded(payload);
        break;
      case 'recording.completed':
        await handleRecordingCompleted(payload);
        break;
      default:
        console.log('Unhandled Zoom event:', event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper functions for webhook events
async function handleMeetingStarted(payload) {
  const meetingId = payload.object.id.toString();
  
  await Course.updateOne(
    { 'schedule.zoomMeetingId': meetingId },
    { $set: { 'schedule.$.status': 'started' } }
  );

  // Send notifications to enrolled students
  const course = await Course.findOne({ 'schedule.zoomMeetingId': meetingId });
  if (course) {
    const notifications = course.enrolledStudents.map(student => ({
      userId: student.studentId,
      type: 'class_starting',
      title: 'Class is Now Live!',
      message: `Join your class for ${course.title} now`,
      metadata: { courseId: course._id },
      priority: 'urgent'
    }));

    await Notification.insertMany(notifications);
  }
}

async function handleMeetingEnded(payload) {
  const meetingId = payload.object.id.toString();
  
  await Course.updateOne(
    { 'schedule.zoomMeetingId': meetingId },
    { $set: { 'schedule.$.status': 'ended' } }
  );
}

async function handleRecordingCompleted(payload) {
  const meetingId = payload.object.id.toString();
  const recordingUrl = payload.object.recording_files?.[0]?.play_url;

  if (recordingUrl) {
    await Course.updateOne(
      { 'schedule.zoomMeetingId': meetingId },
      { $set: { 'schedule.$.recordingUrl': recordingUrl } }
    );
  }
}
