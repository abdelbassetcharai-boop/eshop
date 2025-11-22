const express = require('express');
const router = express.Router();
const {
  getShippingZones, // تم تغيير getShippingCompanies إلى getShippingZones
  calculateShipping
} = require('../controllers/shippingController');
const auth = require('../middleware/auth');

// مناطق الشحن متاحة للجميع
router.get('/zones', getShippingZones); // تم تعديل المسار
// حساب الشحن يحتاج مصادقة
router.post('/calculate', auth, calculateShipping);

module.exports = router;