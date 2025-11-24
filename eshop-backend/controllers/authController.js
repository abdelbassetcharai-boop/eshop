const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// دالة مساعدة لإنشاء التوكن وإرساله في الرد (Cookie + JSON)
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

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

  const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExist.rows.length > 0) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // حماية: منع المستخدم العادي من تسجيل نفسه كأدمن أو بائع مباشرة عبر هذا المسار
  const userRole = 'customer';

  const newUser = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, userRole]
  );

  sendTokenResponse(newUser.rows[0], 201, res);
});

// @desc    Register as a Vendor
// @route   POST /api/auth/vendor/register
// @access  Public
exports.registerVendor = asyncHandler(async (req, res, next) => {
  const { name, email, password, store_name } = req.body;

  // 1. التحقق من وجود البريد الإلكتروني
  const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExist.rows.length > 0) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // 2. إنشاء slug للمتجر (اسم فريد يستخدم في الرابط)
  const storeSlug = store_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

  // التحقق من عدم تكرار الـ slug
  const slugExist = await pool.query('SELECT * FROM vendors WHERE store_slug = $1', [storeSlug]);
  if (slugExist.rows.length > 0) {
    return next(new ErrorResponse('Store name already taken, please choose another', 400));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 3. تشفير كلمة المرور وإنشاء المستخدم
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'vendor') RETURNING *",
      [name, email, hashedPassword]
    );
    const newUser = userResult.rows[0];

    // 4. إنشاء ملف البائع
    await client.query(
      "INSERT INTO vendors (user_id, store_name, store_slug, is_approved) VALUES ($1, $2, $3, false)",
      [newUser.id, store_name, storeSlug]
    );

    await client.query('COMMIT');

    // إرسال الرد مع التوكن (تسجيل دخول تلقائي)
    // ملاحظة: يمكن منع تسجيل الدخول التلقائي إذا كانت السياسة تتطلب موافقة الإدارة أولاً
    sendTokenResponse(newUser, 201, res);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return next(new ErrorResponse('Vendor registration failed', 500));
  } finally {
    client.release();
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

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