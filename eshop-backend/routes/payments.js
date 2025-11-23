const express = require('express');
const { processPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// المسار: POST /api/payments
// الوصف: معالجة دفع لطلب معين (يتطلب تسجيل دخول)
router.post('/', protect, processPayment);

module.exports = router;