const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
} = require('../controllers/authController');

const router = express.Router();

// استيراد الـ Middlewares
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validation/schemas');

// --- المسارات العامة (Public) ---

// تسجيل مستخدم جديد (مع التحقق من صحة البيانات)
router.post('/register', validate(registerSchema), register);

// تسجيل الدخول (مع التحقق من صحة البيانات)
router.post('/login', validate(loginSchema), login);

// --- المسارات المحمية (Protected) ---
// تتطلب توكن صالح للوصول إليها

router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

// ملاحظة: يمكن إضافة مسار لتغيير كلمة المرور هنا مستقبلاً
// router.put('/updatepassword', protect, updatePassword);

module.exports = router;