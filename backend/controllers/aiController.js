const aiService = require('../services/aiService');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Get AI study recommendations
// @route   POST /api/ai/recommend
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId'
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

    // Check if user is enrolled
    const enrollment = course.enrolledStudents.find(
      e => e.studentId.toString() === (userId || req.user.id)
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course'
      });
    }

    // Get user submissions for this course
    const assignments = await Assignment.find({ courseId }).limit(5);
    const submissions = await Submission.find({
      studentId: userId || req.user.id,
      assignmentId: { $in: assignments.map(a => a._id) }
    });

    // Calculate progress metrics
    const recentGrades = submissions.map(s => 
      s.score ? ((s.score / s.assignmentId?.maxScore) * 100).toFixed(0) : null
    ).filter(g => g !== null);

    const userProgress = {
      completedLessons: enrollment.progress || 0,
      recentGrades,
      strugglingAreas: recentGrades.some(g => g < 60) ? ['Assignments'] : [],
      pace: 'Normal'
    };

    // Get AI recommendations
    const recommendations = await aiService.getStudyRecommendations(
      userId || req.user.id,
      courseId,
      userProgress
    );

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

// @desc    Get resource recommendations
// @route   POST /api/ai/resources
// @access  Private
exports.getResourceRecommendations = async (req, res) => {
  try {
    const { courseId, currentTopic } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get resource recommendations
    const resources = await aiService.getResourceRecommendations(
      course.title,
      course.description,
      currentTopic
    );

    res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Get resource recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating resource recommendations',
      error: error.message
    });
  }
};

// @desc    Analyze student performance
// @route   GET /api/ai/performance-analysis/:courseId
// @access  Private (Student)
exports.analyzePerformance = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get assignments for course
    const assignments = await Assignment.find({ courseId });
    
    // Get student submissions
    const submissions = await Submission.find({
      studentId: req.user.id,
      assignmentId: { $in: assignments.map(a => a._id) }
    }).populate('assignmentId');

    if (submissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No submissions yet',
        data: null
      });
    }

    // Analyze performance
    const analysis = await aiService.analyzePerformance(
      submissions,
      submissions.map(s => s.assignmentId)
    );

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Performance analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing performance',
      error: error.message
    });
  }
};

// @desc    Generate study plan
// @route   POST /api/ai/study-plan
// @access  Private
exports.generateStudyPlan = async (req, res) => {
  try {
    const { courseId, hoursPerWeek, studentLevel } = req.body;

    if (!courseId || !hoursPerWeek) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId and hoursPerWeek'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Generate study plan
    const studyPlan = await aiService.generateStudyPlan(
      {
        title: course.title,
        description: course.description,
        duration: course.endDate && course.startDate 
          ? Math.ceil((new Date(course.endDate) - new Date(course.startDate)) / (1000 * 60 * 60 * 24 * 7))
          : null
      },
      hoursPerWeek,
      studentLevel || 'intermediate'
    );

    res.status(200).json({
      success: true,
      data: studyPlan
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating study plan',
      error: error.message
    });
  }
};

// @desc    Ask AI a question
// @route   POST /api/ai/ask
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { question, courseId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      });
    }

    let courseContext = 'General programming and technology';
    
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        courseContext = `${course.title} - ${course.description}`;
      }
    }

    // Get AI answer
    const answer = await aiService.answerQuestion(question, courseContext);

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting answer',
      error: error.message
    });
  }
};

// @desc    Pre-grade assignment (Tutor helper)
// @route   POST /api/ai/pre-grade/:submissionId
// @access  Private (Tutor)
exports.preGradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

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
        message: 'Not authorized'
      });
    }

    // Pre-grade using AI
    const preGrade = await aiService.preGradeSubmission(
      submission.assignmentId.description,
      submission.assignmentId.rubric,
      submission.text || 'File submission - manual review required'
    );

    // Save AI pre-grade (don't apply automatically)
    submission.aiPreGrade = preGrade;
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'AI pre-grading complete. Please review and adjust as needed.',
      data: preGrade
    });
  } catch (error) {
    console.error('Pre-grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pre-grading submission',
      error: error.message
    });
  }
};
