const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products with pagination & filtering
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // 1. إعداد الترقيم (Pagination)
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // 2. إعداد الفلترة (Filtering)
  let queryText = 'SELECT * FROM products';
  const queryParams = [];
  let whereClauses = [];

  // فلترة حسب التصنيف
  if (req.query.category) {
    queryParams.push(req.query.category);
    whereClauses.push(`category_id = $${queryParams.length}`);
  }

  // فلترة حسب البحث بالاسم (Search)
  if (req.query.keyword) {
    queryParams.push(`%${req.query.keyword}%`);
    whereClauses.push(`name ILIKE $${queryParams.length}`);
  }

  // تجميع شروط WHERE
  if (whereClauses.length > 0) {
    queryText += ' WHERE ' + whereClauses.join(' AND ');
  }

  // 3. حساب العدد الكلي للنتائج (لأغراض الترقيم في الواجهة الأمامية)
  // نستخدم استعلام منفصل للعد بنفس الشروط
  let countQuery = 'SELECT COUNT(*) FROM products';
  if (whereClauses.length > 0) {
    countQuery += ' WHERE ' + whereClauses.join(' AND ');
  }
  const countResult = await pool.query(countQuery, queryParams); // نستخدم نفس المعاملات للعد
  const total = parseInt(countResult.rows[0].count);

  // 4. إضافة الترتيب والحدود (Sorting & Pagination)
  // الترتيب الافتراضي: الأحدث أولاً
  queryText += ` ORDER BY created_at DESC`;

  // إضافة LIMIT و OFFSET
  // ملاحظة: نحتاج لإضافة قيم limit و offset إلى مصفوفة المعاملات
  queryParams.push(limit);
  queryText += ` LIMIT $${queryParams.length}`;

  queryParams.push(offset);
  queryText += ` OFFSET $${queryParams.length}`;

  // 5. تنفيذ الاستعلام النهائي
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
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

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
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
  // نفترض أن vendor_id هو المستخدم الحالي (الأدمن)
  const { name, description, price, stock, category_id, image_url } = req.body;

  const query = `
    INSERT INTO products (name, description, price, stock, category_id, image_url, vendor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [name, description, price, stock, category_id, image_url, req.user.id];
  const result = await pool.query(query, values);

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, stock, category_id, image_url } = req.body;

  // التحقق من وجود المنتج أولاً
  const check = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    return next(new ErrorResponse(`Product not found`, 404));
  }

  // تحديث الحقول ديناميكياً (COALESCE يحافظ على القيمة القديمة إذا كانت الجديدة null)
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
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // الحذف وإرجاع المعرف للتأكيد
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return next(new ErrorResponse(`Product not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Product deleted successfully'
  });
});