const Course = require('../models/Course');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Notification = require('../models/Notification');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      tutorId,
      tutor, // New parameter for "tutor=me"
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = '-createdAt',
      isPublished // New parameter to filter by published status
    } = req.query;

    // Build query
    const query = {};

    // If tutor=me, show only logged-in tutor's courses (published and unpublished)
    if (tutor === 'me' && req.user && req.user.role === 'tutor') {
      query.tutorId = req.user.id;
      // Don't filter by isPublished or isApproved for tutor's own courses
    } else if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      // Admins can see all courses
      if (isPublished !== undefined) {
        query.isPublished = isPublished === 'true';
      }
    } else {
      // For students and public, only show published AND approved courses
      query.isPublished = true;
      query.isApproved = true;
    }

    if (category) query.category = category;
    if (level) query.level = level;
    if (tutorId) query.tutorId = tutorId;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const courses = await Course.find(query)
      .populate('tutorId', 'name email avatarUrl verifiedTutor')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutorId', 'name email avatarUrl bio verifiedTutor')
      .populate('enrolledStudents.studentId', 'name avatarUrl')
      .populate('ratings.studentId', 'name avatarUrl');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      isEnrolled = course.enrolledStudents.some(
        e => e.studentId._id.toString() === req.user.id
      );
    }

    res.status(200).json({
      success: true,
      data: course,
      isEnrolled
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Tutor only)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      currency,
      category,
      level,
      syllabus,
      maxStudents,
      startDate,
      endDate,
      tags,
      thumbnail,
      schedule // New: Array of class sessions to create Zoom meetings for
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description'
      });
    }

    // Create course
    const course = await Course.create({
      title,
      description,
      tutorId: req.user.id,
      price: price || 0,
      currency: currency || 'NGN',
      category,
      level,
      syllabus,
      maxStudents,
      startDate,
      endDate,
      tags,
      thumbnail
    });

    // Create Zoom meetings for scheduled sessions
    if (schedule && Array.isArray(schedule) && schedule.length > 0) {
      const zoomService = require('../services/zoomService');
      const zoomMeetings = [];

      for (const session of schedule) {
        try {
          // Create Zoom meeting for each session
          const meeting = await zoomService.createMeeting({
            topic: `${title} - ${session.topic || 'Class Session'}`,
            startTime: session.startTime,
            duration: session.duration || 60,
            autoRecording: 'cloud' // Auto-record to cloud
          });

          zoomMeetings.push({
            zoomMeetingId: meeting.meetingId.toString(),
            topic: session.topic || 'Class Session',
            join_url: meeting.join_url,
            start_url: meeting.start_url,
            password: meeting.password,
            startTime: new Date(session.startTime),
            duration: session.duration || 60,
            status: 'scheduled'
          });
        } catch (zoomError) {
          console.error('Zoom meeting creation error:', zoomError);
          // Continue creating other meetings even if one fails
        }
      }

      // Add Zoom meetings to course schedule
      course.schedule = zoomMeetings;
      await course.save();
    }

    // Create course group chat
    const chatRoom = await ChatRoom.create({
      name: `${title} - Group Chat`,
      type: 'course',
      courseId: course._id,
      participants: [
        {
          userId: req.user.id,
          role: 'admin'
        }
      ]
    });

    // Update course with group ID
    course.groupId = chatRoom._id;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Tutor who created it)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Update course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Tutor who created it or Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      e => e.studentId.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Check max students
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Course is full'
      });
    }

    // If course is paid, return payment details
    if (course.price > 0) {
      return res.status(200).json({
        success: true,
        requiresPayment: true,
        amount: course.price,
        currency: course.currency,
        message: 'Please complete payment to enroll'
      });
    }

    // Enroll student (free course)
    course.enrolledStudents.push({
      studentId: req.user.id,
      enrolledAt: Date.now(),
      progress: 0
    });

    await course.save();

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: course._id }
    });

    // Add to course group
    await ChatRoom.findByIdAndUpdate(course.groupId, {
      $addToSet: {
        participants: {
          userId: req.user.id,
          role: 'member'
        }
      }
    });

    // Create notification
    await Notification.create({
      userId: req.user.id,
      type: 'course_enrollment',
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      metadata: { courseId: course._id }
    });

    // Track achievement progress
    const { checkAndUnlockAchievements } = require('./achievementController');
    const StudentStats = require('../models/StudentStats');
    const StudentActivity = require('../models/StudentActivity');
    
    // Update student stats
    let studentStats = await StudentStats.findOne({ userId: req.user.id });
    if (!studentStats) {
      studentStats = await StudentStats.create({ userId: req.user.id });
    }
    studentStats.totalCourses = (await User.findById(req.user.id)).enrolledCourses.length + 1;
    await studentStats.save();

    // Create activity record
    await StudentActivity.create({
      userId: req.user.id,
      activityType: 'course_enrolled',
      title: 'Course Enrolled',
      description: `Enrolled in "${course.title}"`,
      icon: '🎓',
      metadata: {
        courseId: course._id
      }
    });

    // Check for new achievements
    await checkAndUnlockAchievements(req.user.id, 'course_enrolled', {
      courseId: course._id
    });

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      data: course
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
};

// @desc    Get course schedule
// @route   GET /api/courses/:id/schedule
// @access  Private (Enrolled students or tutor)
exports.getCourseSchedule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .select('title schedule tutorId enrolledStudents')
      .populate('tutorId', 'name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    const isEnrolled = course.enrolledStudents.some(
      e => e.studentId.toString() === req.user.id
    );
    const isTutor = course.tutorId && course.tutorId._id.toString() === req.user.id;

    if (!isEnrolled && !isTutor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this schedule'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courseTitle: course.title,
        schedule: course.schedule
      }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
};

// @desc    Add rating/review to course
// @route   POST /api/courses/:id/rating
// @access  Private (Enrolled students only)
exports.addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if enrolled
    const isEnrolled = course.enrolledStudents.some(
      e => e.studentId.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to rate this course'
      });
    }

    // Check if already rated
    const existingRating = course.ratings.find(
      r => r.studentId.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      course.ratings.push({
        studentId: req.user.id,
        rating,
        review
      });
    }

    course.calculateAverageRating();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      averageRating: course.averageRating
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding rating',
      error: error.message
    });
  }
};

// @desc    Approve course (Admin only)
// @route   PUT /api/courses/:id/approve
// @access  Private/Admin
exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isApproved = true;
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();
    course.rejectionReason = undefined;
    await course.save();

    // Create notification for tutor
    await Notification.create({
      recipientId: course.tutorId,
      type: 'course_approved',
      title: 'Course Approved',
      message: `Your course "${course.title}" has been approved and is now visible to students.`,
      relatedId: course._id,
      relatedModel: 'Course'
    });

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      data: course
    });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving course',
      error: error.message
    });
  }
};

// @desc    Reject course (Admin only)
// @route   PUT /api/courses/:id/reject
// @access  Private/Admin
exports.rejectCourse = async (req, res) => {
  try {
    const { reason } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isApproved = false;
    course.rejectionReason = reason;
    await course.save();

    // Create notification for tutor
    await Notification.create({
      recipientId: course.tutorId,
      type: 'course_rejected',
      title: 'Course Requires Changes',
      message: `Your course "${course.title}" needs some improvements. Reason: ${reason}`,
      relatedId: course._id,
      relatedModel: 'Course'
    });

    res.status(200).json({
      success: true,
      message: 'Course rejected',
      data: course
    });
  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting course',
      error: error.message
    });
  }
};

// @desc    Add Zoom meeting to course schedule
// @route   POST /api/courses/:id/schedule
// @access  Private (Tutor who created course)
exports.addSchedule = async (req, res) => {
  try {
    const { topic, startTime, duration } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add schedule to this course'
      });
    }

    // Validation
    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time is required'
      });
    }

    // Create Zoom meeting
    const zoomService = require('../services/zoomService');
    const meeting = await zoomService.createMeeting({
      topic: `${course.title} - ${topic || 'Class Session'}`,
      startTime,
      duration: duration || 60,
      autoRecording: 'cloud'
    });

    // Add to course schedule
    course.schedule.push({
      zoomMeetingId: meeting.meetingId.toString(),
      topic: topic || 'Class Session',
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      password: meeting.password,
      startTime: new Date(startTime),
      duration: duration || 60,
      status: 'scheduled'
    });

    await course.save();

    // Notify all enrolled students
    for (const enrollment of course.enrolledStudents) {
      await Notification.create({
        userId: enrollment.studentId,
        type: 'new_class_scheduled',
        title: 'New Class Scheduled',
        message: `A new class session has been scheduled for ${course.title}`,
        metadata: { 
          courseId: course._id,
          sessionDate: startTime
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Class session scheduled successfully',
      data: course.schedule[course.schedule.length - 1]
    });
  } catch (error) {
    console.error('Add schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding schedule',
      error: error.message
    });
  }
};

// @desc    Update Zoom meeting in course schedule
// @route   PUT /api/courses/:id/schedule/:scheduleId
// @access  Private (Tutor who created course)
exports.updateSchedule = async (req, res) => {
  try {
    const { topic, startTime, duration } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    // Find schedule item
    const scheduleItem = course.schedule.id(req.params.scheduleId);
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }

    // Update Zoom meeting if time/duration changed
    if (startTime || duration) {
      const zoomService = require('../services/zoomService');
      const updateData = {};
      
      if (topic) updateData.topic = `${course.title} - ${topic}`;
      if (startTime) updateData.start_time = startTime;
      if (duration) updateData.duration = duration;

      await zoomService.updateMeeting(scheduleItem.zoomMeetingId, updateData);
    }

    // Update course schedule
    if (topic) scheduleItem.topic = topic;
    if (startTime) scheduleItem.startTime = new Date(startTime);
    if (duration) scheduleItem.duration = duration;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: scheduleItem
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
};

// @desc    Delete Zoom meeting from course schedule
// @route   DELETE /api/courses/:id/schedule/:scheduleId
// @access  Private (Tutor who created course)
exports.deleteSchedule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }

    // Find schedule item
    const scheduleItem = course.schedule.id(req.params.scheduleId);
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }

    // Delete Zoom meeting
    const zoomService = require('../services/zoomService');
    try {
      await zoomService.deleteMeeting(scheduleItem.zoomMeetingId);
    } catch (zoomError) {
      console.error('Zoom delete error:', zoomError);
      // Continue even if Zoom delete fails
    }

    // Remove from course schedule
    scheduleItem.remove();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};

// @desc    Get Zoom meeting join URL (for students)
// @route   GET /api/courses/:id/schedule/:scheduleId/join
// @access  Private (Enrolled students only)
exports.getJoinUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is enrolled
    const isEnrolled = course.enrolledStudents.some(
      e => e.studentId.toString() === req.user.id
    );

    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to join this class'
      });
    }

    // Find schedule item
    const scheduleItem = course.schedule.id(req.params.scheduleId);
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        topic: scheduleItem.topic,
        join_url: scheduleItem.join_url,
        password: scheduleItem.password,
        startTime: scheduleItem.startTime,
        duration: scheduleItem.duration
      }
    });
  } catch (error) {
    console.error('Get join URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting join URL',
      error: error.message
    });
  }
};

// @desc    Get Zoom meeting start URL (for tutor)
// @route   GET /api/courses/:id/schedule/:scheduleId/start
// @access  Private (Tutor who created course)
exports.getStartUrl = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the course tutor can start the meeting'
      });
    }

    // Find schedule item
    const scheduleItem = course.schedule.id(req.params.scheduleId);
    if (!scheduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Schedule item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        topic: scheduleItem.topic,
        start_url: scheduleItem.start_url,
        join_url: scheduleItem.join_url,
        password: scheduleItem.password,
        startTime: scheduleItem.startTime,
        duration: scheduleItem.duration
      }
    });
  } catch (error) {
    console.error('Get start URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting start URL',
      error: error.message
    });
  }
};
