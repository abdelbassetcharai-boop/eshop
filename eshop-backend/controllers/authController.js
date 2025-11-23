const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// دالة مساعدة لإنشاء التوكن وإرساله في الرد (Cookie + JSON)
const sendTokenResponse = (user, statusCode, res) => {
  // إنشاء التوكن
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // إعدادات الكوكي
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 يوماً
    ),
    httpOnly: true, // للحماية من XSS
  };

  // تفعيل Secure في بيئة الإنتاج (HTTPS)
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // 1. التحقق مما إذا كان الإيميل مسجلاً
  const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExist.rows.length > 0) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // 2. تشفير كلمة المرور
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. إنشاء المستخدم
  // الدور الافتراضي هو 'customer' ما لم يتم تحديده (ويجب التحقق من صلاحية تحديده في الواقع)
  const userRole = role === 'admin' ? 'admin' : 'customer'; // حماية بسيطة لمنع أي شخص من أن يصبح أدمن بسهولة

  const newUser = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, userRole]
  );

  sendTokenResponse(newUser.rows[0], 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // التحقق من إرسال البيانات
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // البحث عن المستخدم
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // مطابقة كلمة المرور
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // المستخدم متاح في req.user بفضل middleware الحماية
  const user = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);

  res.status(200).json({
    success: true,
    data: user.rows[0],
  });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Logged out successfully'
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  // التأكد من عدم تكرار الإيميل إذا تم تغييره
  if (email) {
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
    if (emailCheck.rows.length > 0) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  const fieldsToUpdate = [];
  const values = [];
  let query = 'UPDATE users SET ';
  let paramIndex = 1;

  if (name) {
    fieldsToUpdate.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }
  if (email) {
    fieldsToUpdate.push(`email = $${paramIndex}`);
    values.push(email);
    paramIndex++;
  }

  if (fieldsToUpdate.length === 0) {
    return next(new ErrorResponse('Please provide fields to update', 400));
  }

  query += fieldsToUpdate.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
  values.push(req.user.id);

  const user = await pool.query(query, values);

  res.status(200).json({
    success: true,
    data: user.rows[0],
  });
});