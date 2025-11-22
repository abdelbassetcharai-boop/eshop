const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);

module.exports = router;