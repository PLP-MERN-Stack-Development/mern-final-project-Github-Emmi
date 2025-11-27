const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/init', protect, initializePayment);
router.get('/verify/:reference', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

// Webhook (public but verified by signature)
router.post('/webhook', handleWebhook);

module.exports = router;
