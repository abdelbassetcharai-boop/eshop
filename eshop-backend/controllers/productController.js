const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products with pagination & filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let queryText = 'SELECT * FROM products';
  const queryParams = [];
  let whereClauses = [];

  if (req.query.category) {
    queryParams.push(req.query.category);
    whereClauses.push(`category_id = $${queryParams.length}`);
  }

  if (req.query.keyword) {
    queryParams.push(`%${req.query.keyword}%`);
    whereClauses.push(`name ILIKE $${queryParams.length}`);
  }

  // دعم الفلترة حسب البائع
  if (req.query.vendor) {
    queryParams.push(req.query.vendor);
    whereClauses.push(`vendor_id = $${queryParams.length}`);
  }

  // إخفاء المنتجات غير النشطة إلا للأدمن أو صاحب المنتج
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'vendor')) {
     whereClauses.push(`is_active = true`);
  }

  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }

  // حساب العدد الكلي للنتائج
  let countQuery = 'SELECT COUNT(*) FROM products';
  if (whereClauses.length > 0) {
    countQuery += ' WHERE ' + whereClauses.join(' AND ');
  }
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].count);

  queryText += ` ORDER BY created_at DESC`;

  queryParams.push(limit);
  queryText += ` LIMIT $${queryParams.length}`;

  queryParams.push(offset);
  queryText += ` OFFSET $${queryParams.length}`;

  const result = await pool.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    },
    data: result.rows,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // جلب المنتج مع تفاصيل البائع
  const query = `
    SELECT p.*, v.store_name, v.store_slug
    FROM products p
    LEFT JOIN vendors v ON p.vendor_id = v.user_id
    WHERE p.id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return next(new ErrorResponse(`Product not found with id of ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin or Vendor)
exports.createProduct = asyncHandler(async (req, res, next) => {
  // التحقق من الصلاحية: يجب أن يكون vendor أو admin
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
      return next(new ErrorResponse('Not authorized to create products', 403));
  }

  // ربط المنتج بالبائع الحالي
  const vendorId = req.user.id;

  const { name, description, price, stock, category_id, image_url } = req.body;

  const query = `
    INSERT INTO products (name, description, price, stock, category_id, image_url, vendor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [name, description, price, stock, category_id, image_url, vendorId];
  const result = await pool.query(query, values);

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin or Vendor)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image_url } = req.body;

  // 1. التحقق من وجود المنتج
  const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    return next(new ErrorResponse(`Product not found`, 404));
  }

  const product = check.rows[0];

  // 2. التحقق من الملكية: هل المستخدم هو صاحب المنتج أو أدمن؟
  if (req.user.role !== 'admin' && product.vendor_id !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this product`, 403));
  }

  const query = `
    UPDATE products
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        stock = COALESCE($4, stock),
        category_id = COALESCE($5, category_id),
        image_url = COALESCE($6, image_url)
    WHERE id = $7
    RETURNING *
  `;

  const values = [name, description, price, stock, category_id, image_url, id];
  const result = await pool.query(query, values);

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin or Vendor)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1. التحقق من وجود المنتج
  const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    return next(new ErrorResponse(`Product not found`, 404));
  }

  const product = check.rows[0];

  // 2. التحقق من الملكية
  if (req.user.role !== 'admin' && product.vendor_id !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this product`, 403));
  }

  // الحذف وإرجاع المعرف للتأكيد
  await pool.query('DELETE FROM products WHERE id = $1', [id]);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Product deleted successfully'
  });
});