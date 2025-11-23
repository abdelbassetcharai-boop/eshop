const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // جلب التقييمات ودمجها مع جدول المستخدمين لعرض اسم المعلق
  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(query, [productId]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// @desc    Create review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  const userId = req.user.id;

  // 1. التحقق مما إذا كان المستخدم قد قيم المنتج سابقاً
  const checkQuery = 'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2';
  const checkResult = await pool.query(checkQuery, [userId, productId]);

  if (checkResult.rows.length > 0) {
    return next(new ErrorResponse('Product already reviewed', 400));
  }

  // 2. إدراج التقييم الجديد
  const insertQuery = `
    INSERT INTO reviews (user_id, product_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [userId, productId, rating, comment]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});