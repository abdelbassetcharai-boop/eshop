const express = require('express');
const {
  register,
  registerVendor, // دالة تسجيل البائع الجديدة
  login,
  getMe,
  logout,
  updateDetails,
} = require('../controllers/authController');

const router = express.Router();

// استيراد الـ Middlewares
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware');
const {
  registerSchema,
  vendorRegisterSchema, // مخطط التحقق الخاص بالبائع
  loginSchema
} = require('../validation/schemas');

// --- المسارات العامة (Public) ---

// تسجيل مستخدم جديد (عميل)
router.post('/register', validate(registerSchema), register);

// تسجيل بائع جديد (New)
router.post('/vendor/register', validate(vendorRegisterSchema), registerVendor);

// تسجيل الدخول
router.post('/login', validate(loginSchema), login);

// --- المسارات المحمية (Protected) ---
// تتطلب توكن صالح للوصول إليها

router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;