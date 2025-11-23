const express = require('express');
const { getShippingMethods } = require('../controllers/shippingController');

const router = express.Router();

// المسار: GET /api/shipping/methods
// الوصف: جلب طرق الشحن المتاحة والأسعار
router.get('/methods', getShippingMethods);

module.exports = router;