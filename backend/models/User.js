const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  linkedinId: {
    type: String,
    sparse: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin', 'superadmin'],
    default: 'student'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  verifiedTutor: {
    type: Boolean,
    default: false
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  phone: String,
  location: String,
  website: String,
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    courseUpdates: { type: Boolean, default: true },
    assignmentReminders: { type: Boolean, default: true },
    communityPosts: { type: Boolean, default: false },
    profileVisibility: { type: String, enum: ['public', 'enrolled', 'private'], default: 'public' }
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Sync profilePicture and avatarUrl
userSchema.pre('save', function(next) {
  // If profilePicture is set but not avatarUrl, sync them
  if (this.profilePicture && !this.avatarUrl) {
    this.avatarUrl = this.profilePicture;
  }
  // If avatarUrl is set but not profilePicture, sync them
  if (this.avatarUrl && !this.profilePicture) {
    this.profilePicture = this.avatarUrl;
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.emailVerificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);
