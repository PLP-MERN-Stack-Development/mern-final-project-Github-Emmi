const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN'
  },
  provider: {
    type: String,
    enum: ['paystack', 'stripe'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  customerEmail: String,
  metadata: {
    type: Map,
    of: String
  },
  paidAt: Date,
  refundedAt: Date,
  refundReason: String
}, {
  timestamps: true
});

// Index for querying
paymentSchema.index({ userId: 1, courseId: 1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
