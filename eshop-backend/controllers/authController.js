const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') options.secure = true;

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    }
  });
};

// @desc    Register user
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userExist.rows.length > 0) return next(new ErrorResponse('Email already registered', 400));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const newUser = await pool.query(
    'INSERT INTO users (name, email, password, role, is_verified, verification_token) VALUES ($1, $2, $3, $4, false, $5) RETURNING *',
    [name, email, hashedPassword, 'customer', verificationToken]
  );

  try {
      await sendVerificationEmail(newUser.rows[0], verificationToken);
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      });
  } catch (err) {
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
      return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Verify Email
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    const userResult = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);

    if (userResult.rows.length === 0) {
        return next(new ErrorResponse('Invalid or expired verification token', 400));
    }

    const user = userResult.rows[0];

    await pool.query(
        'UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1',
        [user.id]
    );

    sendWelcomeEmail(user).catch(console.error);
    sendTokenResponse(user, 200, res);
});

// @desc    Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return next(new ErrorResponse('Invalid credentials', 401));

  if (!user.is_verified) {
      return next(new ErrorResponse('Please verify your email address first. Check your inbox.', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot Password (Send OTP)
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }
  const user = userResult.rows[0];

  // إنشاء كود رقمي من 6 أرقام
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

  try {
    await pool.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3',
        [resetToken, resetExpire, user.id]
    );

    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    await pool.query(
        'UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = $1',
        [user.id]
    );
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset Password (Verify OTP & Set New Password)
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;

  const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expire > NOW()',
      [email, code]
  );

  if (userResult.rows.length === 0) {
    return next(new ErrorResponse('Invalid token or token expired', 400));
  }
  const user = userResult.rows[0];

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2',
      [hashedPassword, user.id]
  );

  sendTokenResponse(user, 200, res);
});

exports.registerVendor = asyncHandler(async (req, res, next) => {
    const { name, email, password, store_name } = req.body;
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) return next(new ErrorResponse('Email already registered', 400));

    const storeSlug = store_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const slugExist = await pool.query('SELECT * FROM vendors WHERE store_slug = $1', [storeSlug]);
    if (slugExist.rows.length > 0) return next(new ErrorResponse('Store name already taken', 400));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userResult = await client.query(
        "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, 'vendor', true) RETURNING *",
        [name, email, hashedPassword]
      );
      const newUser = userResult.rows[0];

      await client.query(
        "INSERT INTO vendors (user_id, store_name, store_slug, is_approved) VALUES ($1, $2, $3, false)",
        [newUser.id, store_name, storeSlug]
      );

      await client.query('COMMIT');

      sendWelcomeEmail(newUser).catch(console.error);
      sendTokenResponse(newUser, 201, res);
    } catch (err) {
      await client.query('ROLLBACK');
      return next(new ErrorResponse('Vendor registration failed', 500));
    } finally {
      client.release();
    }
});

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    res.status(200).json({ success: true, data: user.rows[0] });
});

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).json({ success: true, data: {}, message: 'Logged out successfully' });
});

exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;
    if (email) {
      const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
      if (emailCheck.rows.length > 0) return next(new ErrorResponse('Email already in use', 400));
    }
    const fieldsToUpdate = [];
    const values = [];
    let query = 'UPDATE users SET ';
    let paramIndex = 1;
    if (name) { fieldsToUpdate.push(`name = $${paramIndex}`); values.push(name); paramIndex++; }
    if (email) { fieldsToUpdate.push(`email = $${paramIndex}`); values.push(email); paramIndex++; }
    if (fieldsToUpdate.length === 0) return next(new ErrorResponse('Please provide fields to update', 400));
    query += fieldsToUpdate.join(', ') + ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
    values.push(req.user.id);
    const user = await pool.query(query, values);
    res.status(200).json({ success: true, data: user.rows[0] });
});