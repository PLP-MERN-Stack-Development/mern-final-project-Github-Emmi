require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Find the student
    const student = await User.findOne({ email: 'john@student.com' });
    
    if (!student) {
      console.log('❌ Student not found. Please run seed script first: node seed.js');
      process.exit(1);
    }

    console.log('✅ Found student:', student.email);
    console.log('Current role:', student.role);
    
    // Update password - the pre-save hook will hash it
    student.passwordHash = 'password123';
    await student.save();
    
    console.log('✅ Password reset to: password123');
    console.log('✅ You can now login with:');
    console.log('   Email: john@student.com');
    console.log('   Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixPassword();
