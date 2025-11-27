const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email
exports.sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

// Welcome email template
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to EmmiDev CodeBridge! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining EmmiDev CodeBridge. We're excited to have you as part of our learning community!</p>
      <p>Get started by exploring our courses and connecting with tutors.</p>
      <p>Happy Learning!</p>
      <p>Best regards,<br>The EmmiDev Team</p>
    </div>
  `;

  await this.sendEmail({
    email: user.email,
    subject: 'Welcome to EmmiDev CodeBridge',
    html,
  });
};

// Enrollment confirmation email
exports.sendEnrollmentEmail = async (user, course) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Course Enrollment Successful! 📚</h2>
      <p>Hi ${user.name},</p>
      <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
      <p>You can now access all course materials and join live classes.</p>
      <p>Best regards,<br>The EmmiDev Team</p>
    </div>
  `;

  await this.sendEmail({
    email: user.email,
    subject: `Enrolled in ${course.title}`,
    html,
  });
};

// Assignment notification email
exports.sendAssignmentNotification = async (user, assignment, course) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Assignment Posted 📝</h2>
      <p>Hi ${user.name},</p>
      <p>A new assignment has been posted in <strong>${course.title}</strong>.</p>
      <p><strong>Assignment:</strong> ${assignment.title}</p>
      <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
      <p>Login to your account to view and submit the assignment.</p>
      <p>Best regards,<br>The EmmiDev Team</p>
    </div>
  `;

  await this.sendEmail({
    email: user.email,
    subject: `New Assignment: ${assignment.title}`,
    html,
  });
};

// Class reminder email
exports.sendClassReminderEmail = async (user, course, classSession) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Class Reminder 🔔</h2>
      <p>Hi ${user.name},</p>
      <p>Your class is starting soon!</p>
      <p><strong>Course:</strong> ${course.title}</p>
      <p><strong>Topic:</strong> ${classSession.topic}</p>
      <p><strong>Time:</strong> ${new Date(classSession.startTime).toLocaleString()}</p>
      <p><a href="${classSession.join_url}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Join Class Now</a></p>
      <p>Best regards,<br>The EmmiDev Team</p>
    </div>
  `;

  await this.sendEmail({
    email: user.email,
    subject: `Class Starting Soon: ${course.title}`,
    html,
  });
};
