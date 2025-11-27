const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Post = require('../models/Post');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// ==================== USER MANAGEMENT ====================

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      verified,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (role) query.role = role;
    if (status) query.isActive = status === 'active';
    if (verified === 'true') query.verifiedTutor = true;
    if (verified === 'false') query.verifiedTutor = false;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('enrolledCourses', 'title thumbnail tutorId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's submissions, posts, and payments
    const [assignments, posts, payments] = await Promise.all([
      Assignment.find({ 'submissions.student': user._id }).select('title dueDate'),
      Post.find({ authorId: user._id }).select('contentText createdAt'),
      Payment.find({ userId: user._id }).select('amount status createdAt')
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalAssignments: assignments.length,
          totalPosts: posts.length,
          totalPayments: payments.length,
          totalSpent: payments.reduce((sum, p) => sum + p.amount, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Create new user (manual registration)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, verifiedTutor } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role || 'student',
      verifiedTutor: role === 'tutor' ? verifiedTutor : false,
      emailVerified: true // Admin-created users are auto-verified
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Update user (role, status, verification)
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, verifiedTutor, name, email } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    if (typeof verifiedTutor !== 'undefined') user.verifiedTutor = verifiedTutor;

    await user.save();

    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: 'account_update',
      title: 'Account Updated',
      message: 'Your account has been updated by an administrator',
      metadata: { updatedBy: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// ==================== COURSE MANAGEMENT ====================

// @desc    Get all courses with filters
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      isPublished,
      tutorId,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (typeof isPublished !== 'undefined') query.isPublished = isPublished === 'true';
    if (tutorId) query.tutorId = tutorId;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('tutorId', 'name email verifiedTutor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: courses
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Approve course
// @route   PATCH /api/admin/courses/:id/approve
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

    // Set approval fields
    course.isApproved = true;
    course.approvedBy = req.user.id;
    course.approvedAt = Date.now();
    course.rejectionReason = undefined;
    await course.save();

    // Notify tutor
    await Notification.create({
      userId: course.tutorId,
      type: 'course_approved',
      title: 'Course Approved',
      message: `Your course "${course.title}" has been approved and is now visible to students.`,
      metadata: { courseId: course._id },
      priority: 'high'
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

// @desc    Reject course
// @route   PATCH /api/admin/courses/:id/reject
// @access  Private/Admin
exports.rejectCourse = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Set rejection fields
    course.isApproved = false;
    course.rejectionReason = reason;
    course.approvedBy = undefined;
    course.approvedAt = undefined;
    await course.save();

    // Notify tutor with feedback
    await Notification.create({
      userId: course.tutorId,
      type: 'course_rejected',
      title: 'Course Requires Changes',
      message: `Your course "${course.title}" needs improvements. Reason: ${reason}`,
      metadata: { courseId: course._id, reason },
      priority: 'high'
    });

    res.status(200).json({
      success: true,
      message: 'Course rejected with feedback sent to tutor',
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

// @desc    Assign tutor to course
// @route   PATCH /api/admin/courses/:id/assign
// @access  Private/Admin
exports.assignTutorToCourse = async (req, res) => {
  try {
    const { tutorId } = req.body;

    // Verify tutor exists and is verified
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tutor ID'
      });
    }

    if (!tutor.verifiedTutor) {
      return res.status(400).json({
        success: false,
        message: 'Tutor must be verified first'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.tutorId = tutorId;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Tutor assigned successfully',
      data: course
    });
  } catch (error) {
    console.error('Assign tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning tutor',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
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

// ==================== ASSIGNMENT OVERSIGHT ====================

// @desc    Get all assignments
// @route   GET /api/admin/assignments
// @access  Private/Admin
exports.getAllAssignments = async (req, res) => {
  try {
    const { courseId, tutorId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (tutorId) query.tutorId = tutorId;

    const assignments = await Assignment.find(query)
      .populate('courseId', 'title')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: assignments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
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

// @desc    Delete assignment
// @route   DELETE /api/admin/assignments/:id
// @access  Private/Admin
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// ==================== FEED MODERATION ====================

// @desc    Get all posts
// @route   GET /api/admin/feeds
// @access  Private/Admin
exports.getAllPosts = async (req, res) => {
  try {
    const { isHidden, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (isHidden !== undefined) {
      query.isHidden = isHidden === 'true';
    }

    const posts = await Post.find(query)
      .populate('authorId', 'fullName email profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Flag/Delete post
// @route   PATCH /api/admin/feeds/:id/flag
// @access  Private/Admin
exports.flagPost = async (req, res) => {
  try {
    const { isHidden, reason } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isHidden = isHidden;
    if (reason) post.moderationReason = reason;
    
    await post.save();

    // Notify post author
    if (isHidden) {
      await Notification.create({
        userId: post.authorId,
        type: 'post_flagged',
        title: 'Post Flagged',
        message: `Your post has been flagged by moderators. Reason: ${reason || 'Inappropriate content'}`,
        metadata: { postId: post._id }
      });
    }

    res.status(200).json({
      success: true,
      message: isHidden ? 'Post flagged successfully' : 'Post unflagged',
      data: post
    });
  } catch (error) {
    console.error('Flag post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging post',
      error: error.message
    });
  }
};

// ==================== PAYMENTS ====================

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status, userId, courseId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Payment.countDocuments(query);
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalRevenue: totalRevenue[0]?.total || 0,
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Issue payment refund
// @route   PATCH /api/admin/payments/:id/refund
// @access  Private/Admin
exports.issueRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    if (payment.status !== 'success' && payment.status !== 'successful') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded'
      });
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = reason || 'Admin initiated refund';
    await payment.save();

    // Notify user about refund
    await Notification.create({
      userId: payment.userId,
      type: 'payment_refunded',
      title: 'Payment Refunded',
      message: `Your payment of ${payment.amount} ${payment.currency} has been refunded. Reason: ${payment.refundReason}`,
      metadata: { paymentId: payment._id }
    });

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Issue refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing refund',
      error: error.message
    });
  }
};

// ==================== ANALYTICS ====================

// @desc    Get platform overview
// @route   GET /api/admin/analytics/overview
// @access  Private/Admin
exports.getPlatformOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalCourses,
      totalAssignments,
      totalPosts,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'tutor' }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Post.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tutorId', 'name')
      .select('title tutorId createdAt');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStudents,
          totalTutors,
          totalCourses,
          totalAssignments,
          totalPosts,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recent: {
          users: recentUsers,
          courses: recentCourses
        }
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// @desc    Get user growth stats
// @route   GET /api/admin/analytics/user-growth
// @access  Private/Admin
exports.getUserGrowth = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const growth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: parseInt(months) }
    ]);

    res.status(200).json({
      success: true,
      data: growth
    });
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth',
      error: error.message
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topCourses = await Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: '$courseId',
          revenue: { $sum: '$amount' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenueByMonth,
        topCourses
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

// @desc    Get engagement stats
// @route   GET /api/admin/analytics/engagement
// @access  Private/Admin
exports.getEngagementStats = async (req, res) => {
  try {
    const engagementByMonth = await Post.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          posts: { $sum: 1 },
          totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
          totalComments: { $sum: { $size: { $ifNull: ['$comments', []] } } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Calculate total engagement
    const totalPosts = await Post.countDocuments();
    const allPosts = await Post.find().select('likes comments');
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
    const totalComments = allPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        engagementByMonth,
        totals: {
          posts: totalPosts,
          likes: totalLikes,
          comments: totalComments,
          interactions: totalLikes + totalComments
        }
      }
    });
  } catch (error) {
    console.error('Get engagement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching engagement stats',
      error: error.message
    });
  }
};
