const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const query = 'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [req.user.id]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = asyncHandler(async (req, res, next) => {
  const { address_line1, address_line2, city, postal_code, country, phone } = req.body;

  // التحقق من الحقول المطلوبة (يمكن أيضاً استخدام Joi هنا)
  if (!address_line1 || !city || !country) {
    return next(new ErrorResponse('Please provide address line 1, city and country', 400));
  }

  const query = `
    INSERT INTO user_addresses (user_id, address_line1, address_line2, city, postal_code, country, phone)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [req.user.id, address_line1, address_line2, city, postal_code, country, phone];
  const result = await pool.query(query, values);

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { address_line1, address_line2, city, postal_code, country, phone } = req.body;

  // 1. التحقق من أن العنوان موجود ويخص المستخدم الحالي
  const check = await pool.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);

  if (check.rows.length === 0) {
    return next(new ErrorResponse('Address not found or unauthorized', 404));
  }

  // 2. التحديث
  const query = `
    UPDATE user_addresses
    SET address_line1 = COALESCE($1, address_line1),
        address_line2 = COALESCE($2, address_line2),
        city = COALESCE($3, city),
        postal_code = COALESCE($4, postal_code),
        country = COALESCE($5, country),
        phone = COALESCE($6, phone)
    WHERE id = $7
    RETURNING *
  `;

  const values = [address_line1, address_line2, city, postal_code, country, phone, id];
  const result = await pool.query(query, values);

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // التحقق من الملكية قبل الحذف
  const check = await pool.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [id, req.user.id]);

  if (check.rows.length === 0) {
    return next(new ErrorResponse('Address not found or unauthorized', 404));
  }

  await pool.query('DELETE FROM user_addresses WHERE id = $1', [id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Address removed'
  });
});