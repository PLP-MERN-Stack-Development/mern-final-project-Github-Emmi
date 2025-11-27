const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelper');
const { sendAssignmentNotification } = require('../utils/emailService');
const User = require('../models/User');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Tutor)
exports.createAssignment = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      instructions,
      dueDate,
      maxScore,
      allowLateSubmission,
      lateSubmissionPenalty,
      rubric
    } = req.body;

    // Validation
    if (!courseId || !title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if course exists and user is the tutor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create assignments for this course'
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      courseId,
      tutorId: req.user.id,
      title,
      description,
      instructions,
      dueDate,
      maxScore: maxScore || 100,
      allowLateSubmission,
      lateSubmissionPenalty,
      rubric,
      isPublished: true
    });

    // Notify all enrolled students
    const enrolledStudents = await User.find({
      _id: { $in: course.enrolledStudents.map(s => s.studentId) }
    });

    const notifications = enrolledStudents.map(student => ({
      userId: student._id,
      type: 'new_assignment',
      title: 'New Assignment Posted',
      message: `New assignment "${title}" has been posted in ${course.title}`,
      metadata: {
        courseId: course._id,
        assignmentId: assignment._id
      },
      priority: 'high'
    }));

    await Notification.insertMany(notifications);

    // Send emails asynchronously
    enrolledStudents.forEach(student => {
      sendAssignmentNotification(student, assignment, course)
        .catch(err => console.error('Assignment email error:', err));
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private (Enrolled students and tutor)
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ courseId, isPublished: true })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'title tutorId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user has submitted
    let submission = null;
    if (req.user.role === 'student') {
      submission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
      submission
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res) => {
  try {
    const { text } = req.body;
    const assignmentId = req.params.id;

    // Get assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.courseId);
    const isEnrolled = course.enrolledStudents.some(
      s => s.studentId.toString() === req.user.id
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to submit assignments'
      });
    }

    // Check due date
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Submission deadline has passed and late submissions are not allowed'
      });
    }

    // Handle file uploads
    let files = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          'assignments'
        );
        files.push({
          fileName: file.originalname,
          fileUrl: uploadResult.url,
          fileType: uploadResult.format,
          cloudinaryId: uploadResult.cloudinaryId
        });
      }
    }

    // Check for existing submission
    let submission = await Submission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (submission) {
      // Update existing submission
      submission.files = files.length > 0 ? files : submission.files;
      submission.text = text || submission.text;
      submission.submittedAt = Date.now();
      submission.isLate = isLate;
      submission.attemptNumber += 1;
      submission.status = 'submitted';
    } else {
      // Create new submission
      submission = await Submission.create({
        assignmentId,
        studentId: req.user.id,
        files,
        text,
        isLate,
        status: 'submitted'
      });
    }

    await submission.save();

    // Track achievement progress
    const { checkAndUnlockAchievements } = require('./achievementController');
    const StudentStats = require('../models/StudentStats');
    const StudentActivity = require('../models/StudentActivity');
    
    // Update student stats
    let studentStats = await StudentStats.findOne({ userId: req.user.id });
    if (!studentStats) {
      studentStats = await StudentStats.create({ userId: req.user.id });
    }
    studentStats.completedAssignments = await Submission.countDocuments({
      studentId: req.user.id,
      status: { $in: ['submitted', 'graded'] }
    });
    await studentStats.save();

    // Create activity record
    await StudentActivity.create({
      userId: req.user.id,
      activityType: 'assignment_submitted',
      title: 'Assignment Submitted',
      description: `Submitted "${assignment.title}"`,
      icon: '📝',
      metadata: {
        assignmentId: assignment._id,
        courseId: assignment.courseId
      }
    });

    // Check for new achievements
    await checkAndUnlockAchievements(req.user.id, 'assignment_submitted', {
      assignmentId: assignment._id
    });

    // Notify tutor (use assignment.tutorId instead of course.tutorId)
    await Notification.create({
      userId: assignment.tutorId,
      type: 'assignment_submitted',
      title: 'New Assignment Submission',
      message: `${req.user.name} submitted "${assignment.title}"`,
      metadata: {
        courseId: assignment.courseId,
        assignmentId: assignment._id,
        submissionId: submission._id,
        studentId: req.user.id
      },
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
};

// @desc    Grade assignment submission
// @route   PUT /api/assignments/submission/:id/grade
// @access  Private (Tutor)
exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submissionId = req.params.id;

    // Get submission
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check authorization
    const course = await Course.findById(submission.assignmentId.courseId);
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this submission'
      });
    }

    // Validate score
    if (score > submission.assignmentId.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed ${submission.assignmentId.maxScore}`
      });
    }

    // Apply late penalty if applicable
    let finalScore = score;
    if (submission.isLate && submission.assignmentId.lateSubmissionPenalty > 0) {
      const penalty = (score * submission.assignmentId.lateSubmissionPenalty) / 100;
      finalScore = Math.max(0, score - penalty);
    }

    // Update submission
    submission.score = finalScore;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;

    await submission.save();

    // Track achievement progress for graded assignment
    const { checkAndUnlockAchievements } = require('./achievementController');
    const StudentActivity = require('../models/StudentActivity');
    
    // Calculate percentage
    const percentage = (finalScore / submission.assignmentId.maxScore) * 100;
    
    // Create activity record
    await StudentActivity.create({
      userId: submission.studentId,
      activityType: 'assignment_graded',
      title: 'Assignment Graded',
      description: `Received ${percentage.toFixed(0)}% on "${submission.assignmentId.title}"`,
      icon: percentage >= 90 ? '⭐' : percentage >= 70 ? '👍' : '📊',
      metadata: {
        assignmentId: submission.assignmentId._id,
        courseId: course._id,
        score: finalScore
      }
    });

    // Check for new achievements
    await checkAndUnlockAchievements(submission.studentId.toString(), 'assignment_graded', {
      score: finalScore,
      maxScore: submission.assignmentId.maxScore
    });

    // Notify student
    const notification = await Notification.create({
      userId: submission.studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${submission.assignmentId.title}" has been graded`,
      metadata: {
        assignmentId: submission.assignmentId._id,
        courseId: course._id,
        score: finalScore,
        maxScore: submission.assignmentId.maxScore
      },
      priority: 'high'
    });

    // Send real-time notification via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(submission.studentId.toString()).emit('notification', {
        ...notification.toObject(),
        message: `Your assignment "${submission.assignmentId.title}" has been graded: ${finalScore}/${submission.assignmentId.maxScore}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message
    });
  }
};

// @desc    Get all submissions for an assignment (Tutor view)
// @route   GET /api/assignments/:id/submissions
// @access  Private (Tutor)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check authorization
    const course = await Course.findById(assignment.courseId);
    if (course.tutorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these submissions'
      });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email avatarUrl')
      .populate('gradedBy', 'name')
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Get student's own submissions
// @route   GET /api/assignments/my-submissions
// @access  Private (Student)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('assignmentId', 'title dueDate maxScore courseId')
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'courseId',
          select: 'title'
        }
      })
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Get tutor's assignments (all assignments for courses they teach)
// @route   GET /api/assignments/tutor/my-assignments
// @access  Private (Tutor)
exports.getTutorAssignments = async (req, res) => {
  try {
    const Course = require('../models/Course');
    
    // Find all courses taught by this tutor
    const tutorCourses = await Course.find({ tutorId: req.user.id }).select('_id title');
    const courseIds = tutorCourses.map(course => course._id);

    // Find all assignments for these courses
    const assignments = await Assignment.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title')
      .sort('-createdAt');

    // Get submission counts for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const totalSubmissions = await Submission.countDocuments({ 
          assignmentId: assignment._id 
        });
        const gradedSubmissions = await Submission.countDocuments({ 
          assignmentId: assignment._id,
          status: 'graded'
        });
        const pendingSubmissions = await Submission.countDocuments({ 
          assignmentId: assignment._id,
          status: 'submitted'
        });

        return {
          ...assignment.toObject(),
          stats: {
            totalSubmissions,
            gradedSubmissions,
            pendingSubmissions
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: assignmentsWithStats.length,
      data: assignmentsWithStats
    });
  } catch (error) {
    console.error('Get tutor assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutor assignments',
      error: error.message
    });
  }
};

// @desc    Get all pending submissions for tutor's assignments
// @route   GET /api/assignments/tutor/pending-submissions
// @access  Private (Tutor)
exports.getTutorPendingSubmissions = async (req, res) => {
  try {
    // Find all assignments created by this tutor
    const tutorAssignments = await Assignment.find({ tutorId: req.user.id }).select('_id');
    const assignmentIds = tutorAssignments.map(assignment => assignment._id);

    // Find all submitted (not graded) submissions for these assignments
    const pendingSubmissions = await Submission.find({ 
      assignmentId: { $in: assignmentIds },
      status: 'submitted'
    })
      .populate('studentId', 'name email avatarUrl')
      .populate('assignmentId', 'title dueDate maxScore courseId')
      .populate({
        path: 'assignmentId',
        populate: {
          path: 'courseId',
          select: 'title'
        }
      })
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: pendingSubmissions.length,
      data: pendingSubmissions
    });
  } catch (error) {
    console.error('Get tutor pending submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending submissions',
      error: error.message
    });
  }
};
