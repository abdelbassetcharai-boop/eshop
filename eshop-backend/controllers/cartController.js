const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res, next) => {
  // تعديل: استخدام الجدول 'cart' بدلاً من 'cart_items'
  const query = `
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.stock
    FROM cart ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at DESC
  `;

  const result = await pool.query(query, [req.user.id]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  // 1. التحقق من توفر المنتج في المخزون
  const productCheck = await pool.query('SELECT stock FROM products WHERE id = $1', [productId]);

  if (productCheck.rows.length === 0) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // 2. التحقق مما إذا كان المنتج موجوداً بالفعل في سلة المستخدم (باستخدام الجدول cart)
  const checkQuery = 'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2';
  const checkResult = await pool.query(checkQuery, [req.user.id, productId]);

  let result;

  if (checkResult.rows.length > 0) {
    // إذا كان موجوداً، نقوم بتحديث الكمية فقط
    const updateQuery = `
      UPDATE cart
      SET quantity = quantity + $1
      WHERE user_id = $2 AND product_id = $3
      RETURNING *
    `;
    result = await pool.query(updateQuery, [qty, req.user.id, productId]);
  } else {
    // إذا لم يكن موجوداً، نقوم بإضافته كعنصر جديد
    const insertQuery = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    result = await pool.query(insertQuery, [req.user.id, productId, qty]);
  }

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: result.rows[0],
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // تعديل: الحذف من الجدول 'cart'
  const result = await pool.query(
    'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, req.user.id]
  );

  if (result.rows.length === 0) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Item removed from cart'
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res, next) => {
  // تعديل: إفراغ الجدول 'cart'
  await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Cart cleared successfully'
  });
});