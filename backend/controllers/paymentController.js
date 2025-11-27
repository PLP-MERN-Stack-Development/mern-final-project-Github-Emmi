const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Notification = require('../models/Notification');
const { sendEnrollmentEmail } = require('../utils/emailService');

// @desc    Initialize payment
// @route   POST /api/payments/init
// @access  Private
exports.initializePayment = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Get course
    const course = await Course.findById(courseId);
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

    // Generate unique reference
    const reference = `EMM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Initialize Paystack payment
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: course.price * 100, // Convert to kobo/cents
        currency: course.currency,
        reference,
        metadata: {
          courseId: course._id.toString(),
          userId: req.user.id,
          courseName: course.title
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save payment record
    await Payment.create({
      userId: req.user.id,
      courseId: course._id,
      amount: course.price,
      currency: course.currency,
      provider: 'paystack',
      transactionId: reference,
      reference,
      status: 'pending',
      customerEmail: req.user.email
    });

    res.status(200).json({
      success: true,
      data: {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message
    });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === 'success') {
      // Update payment record
      const payment = await Payment.findOne({ reference });
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      payment.status = 'success';
      payment.transactionId = paymentData.id;
      payment.paymentMethod = paymentData.authorization.channel;
      payment.paidAt = Date.now();
      await payment.save();

      // Enroll student in course
      const course = await Course.findById(payment.courseId);
      course.enrolledStudents.push({
        studentId: payment.userId,
        enrolledAt: Date.now(),
        progress: 0
      });
      await course.save();

      // Add to user's enrolled courses
      await User.findByIdAndUpdate(payment.userId, {
        $addToSet: { enrolledCourses: course._id }
      });

      // Add to course group
      await ChatRoom.findByIdAndUpdate(course.groupId, {
        $addToSet: {
          participants: {
            userId: payment.userId,
            role: 'member'
          }
        }
      });

      // Create notification
      await Notification.create({
        userId: payment.userId,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `You have successfully enrolled in ${course.title}`,
        metadata: { courseId: course._id },
        priority: 'high'
      });

      // Send email
      const user = await User.findById(payment.userId);
      sendEnrollmentEmail(user, course).catch(err => 
        console.error('Enrollment email error:', err)
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified and enrollment successful',
        data: {
          courseId: course._id,
          courseTitle: course.title
        }
      });
    } else {
      // Payment failed
      await Payment.findOneAndUpdate(
        { reference },
        { status: 'failed' }
      );

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Handle Paystack webhook
// @route   POST /api/payments/webhook
// @access  Public (verified by signature)
exports.handleWebhook = async (req, res) => {
  try {
    // Verify Paystack signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    // Handle different events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;
      default:
        console.log('Unhandled Paystack event:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper functions
async function handleChargeSuccess(data) {
  const reference = data.reference;
  
  const payment = await Payment.findOne({ reference });
  if (!payment || payment.status === 'success') {
    return; // Already processed
  }

  payment.status = 'success';
  payment.transactionId = data.id;
  payment.paidAt = Date.now();
  await payment.save();

  // Enroll student (same logic as verify)
  const course = await Course.findById(payment.courseId);
  const alreadyEnrolled = course.enrolledStudents.some(
    e => e.studentId.toString() === payment.userId.toString()
  );

  if (!alreadyEnrolled) {
    course.enrolledStudents.push({
      studentId: payment.userId,
      enrolledAt: Date.now(),
      progress: 0
    });
    await course.save();

    await User.findByIdAndUpdate(payment.userId, {
      $addToSet: { enrolledCourses: course._id }
    });

    await ChatRoom.findByIdAndUpdate(course.groupId, {
      $addToSet: {
        participants: {
          userId: payment.userId,
          role: 'member'
        }
      }
    });

    await Notification.create({
      userId: payment.userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      metadata: { courseId: course._id },
      priority: 'high'
    });
  }
}

async function handleChargeFailed(data) {
  await Payment.findOneAndUpdate(
    { reference: data.reference },
    { status: 'failed' }
  );
}

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('courseId', 'title thumbnail')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};
