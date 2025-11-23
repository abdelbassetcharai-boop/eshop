const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  // جلب جميع التصنيفات مرتبة حسب المعرف
  const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return next(new ErrorResponse(`Category not found with id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image_url } = req.body;

  const result = await pool.query(
    'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
    [name, description, image_url]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, image_url } = req.body;

  // التحقق من وجود التصنيف أولاً
  const check = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    return next(new ErrorResponse(`Category not found with id of ${id}`, 404));
  }

  // تحديث الحقول (استخدام COALESCE للحفاظ على القيم القديمة إذا لم يتم إرسال قيم جديدة)
  const query = `
    UPDATE categories
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        image_url = COALESCE($3, image_url)
    WHERE id = $4
    RETURNING *
  `;

  const result = await pool.query(query, [name, description, image_url, id]);

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // ملاحظة: إذا كان هناك منتجات مرتبطة بهذا التصنيف، قد يفشل الحذف بسبب قيود المفاتيح الأجنبية (Foreign Keys)
  // يجب معالجة ذلك إما بحذف المنتجات أولاً أو استخدام ON DELETE CASCADE في قاعدة البيانات
  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    return next(new ErrorResponse(`Category not found with id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Category deleted successfully'
  });
});