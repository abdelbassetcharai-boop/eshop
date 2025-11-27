const express = require('express');
const {
  register,
  registerVendor,
  login,
  getMe,
  logout,
  updateDetails,
  verifyEmail,
  forgotPassword, // جديد
  resetPassword   // جديد
} = require('../controllers/authController');

const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware');
const { registerSchema, vendorRegisterSchema, loginSchema } = require('../validation/schemas');

// Public Routes
router.post('/register', validate(registerSchema), register);
router.post('/vendor/register', validate(vendorRegisterSchema), registerVendor);
router.post('/login', validate(loginSchema), login);
router.get('/verify/:token', verifyEmail);

// مسارات استعادة كلمة المرور
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

// Protected Routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;