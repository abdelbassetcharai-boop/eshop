const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware'); // استيراد التحقق
const { authSchemas } = require('../validation/schemas');       // استيراد المخططات
const { strictAuthLimiter } = require('../middleware/rateLimiter'); // استيراد محدد المعدل

// routes عامة (لا تحتاج مصادقة)
// تطبيق محدد المعدل والتحقق من المدخلات
router.post('/register', strictAuthLimiter, validate(authSchemas.register), register);
router.post('/login', strictAuthLimiter, validate(authSchemas.login), login);

// routes محمية (تحتاج مصادقة)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile); // يجب إضافة التحقق لـ updateProfile لاحقاً

// إضافة route أساسي لـ /api/auth
router.get('/', (req, res) => {
  res.json({
    message: 'Auth API is working!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile'
    }
  });
});

module.exports = router;