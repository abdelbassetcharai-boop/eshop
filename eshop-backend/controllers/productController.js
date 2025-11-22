const pool = require('../config/database');

// جلب جميع المنتجات
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COALESCE(COUNT(r.id), 0) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.is_active = TRUE -- عرض المنتجات النشطة فقط
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// جلب منتج بواسطة ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(`
      SELECT
        p.*,
        c.name as category_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COALESCE(COUNT(r.id), 0) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name
    `, [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // جلب التقييمات الخاصة بالمنتج
    const reviewsResult = await pool.query(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      success: true,
      product: {
        ...productResult.rows[0],
        reviews: reviewsResult.rows
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// إضافة منتج جديد
const createProduct = async (req, res) => {
  try {
    // يجب أن يكون المستخدم موثوق كـ Vendor/Admin (تم التحقق منه في المسار)
    const vendor_id = req.user.id;
    const { name, description, price, category_id, stock, image_url } = req.body;

    // التحقق من البيانات المطلوبة (يجب إضافة التحقق الشامل هنا لاحقاً)
    if (!name || !price || !category_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, category, and vendor ID are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO products
       (name, description, price, category_id, stock, image_url, vendor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, category_id, stock || 0, image_url, vendor_id]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تحديث منتج
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, stock, image_url, is_active } = req.body;
    const user_id = req.user.id; // البائع أو المشرف الذي يقوم بالتحديث

    // يجب إضافة التحقق من المدخلات هنا
    if (!id) {
       return res.status(400).json({ success: false, error: 'Product ID required' });
    }

    // شرط التحديث: يجب أن يكون المنتج مملوكاً للبائع (أو أن يكون المستخدم مشرفاً، وهو ما يجب إضافته لاحقاً في منطق التحكم)
    // حالياً، المسار محمي بـ vendorAuth، لذا يجب أن يكون البائع هو المالك أو مشرف.
    const updateClauses = [];
    const params = [];
    let paramCount = 1;

    // بناء ديناميكي للـ UPDATE
    if (name) { updateClauses.push(`name = $${paramCount++}`); params.push(name); }
    if (description) { updateClauses.push(`description = $${paramCount++}`); params.push(description); }
    if (price) { updateClauses.push(`price = $${paramCount++}`); params.push(price); }
    if (category_id) { updateClauses.push(`category_id = $${paramCount++}`); params.push(category_id); }
    if (stock) { updateClauses.push(`stock = $${paramCount++}`); params.push(stock); }
    if (image_url) { updateClauses.push(`image_url = $${paramCount++}`); params.push(image_url); }
    if (typeof is_active !== 'undefined') { updateClauses.push(`is_active = $${paramCount++}`); params.push(is_active); }


    if (updateClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    // إضافة شروط الـ WHERE
    params.push(id);
    const productIdIndex = paramCount++;

    // لضمان أن البائع لا يحدث إلا منتجاته، أو أن يكون مشرفاً
    let whereClause = `WHERE id = $${productIdIndex}`;

    if (req.user.role === 'vendor') {
      params.push(user_id);
      whereClause += ` AND vendor_id = $${paramCount}`;
    }
    // المشرف يمكنه التحديث بدون شرط vendor_id

    const result = await pool.query(
      `UPDATE products SET ${updateClauses.join(', ')} ${whereClause} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// حذف منتج
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // لضمان أن البائع لا يحذف إلا منتجاته، أو أن يكون مشرفاً
    let query = 'DELETE FROM products WHERE id = $1';
    const params = [id];

    if (req.user.role === 'vendor') {
      query += ' AND vendor_id = $2';
      params.push(user_id);
    }
    // المشرف يمكنه الحذف بدون شرط vendor_id

    query += ' RETURNING *';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};