const express = require('express');
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// إنشاء نية الدفع (Stripe)
router.post('/create-intent', protect, createPaymentIntent);

// تأكيد الدفع وتحديث الطلب
router.post('/confirm', protect, confirmPayment);

module.exports = router;