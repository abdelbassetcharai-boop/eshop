const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // تنفيذ عدة استعلامات بالتوازي لتحسين الأداء
  const userCountPromise = pool.query('SELECT COUNT(*) FROM users');
  const orderCountPromise = pool.query('SELECT COUNT(*) FROM orders');
  const productCountPromise = pool.query('SELECT COUNT(*) FROM products');
  // حساب مجموع الإيرادات من الطلبات المدفوعة فقط
  const revenuePromise = pool.query("SELECT SUM(total_amount) FROM orders WHERE status = 'paid'");

  const [userRes, orderRes, productRes, revenueRes] = await Promise.all([
    userCountPromise,
    orderCountPromise,
    productCountPromise,
    revenuePromise
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: parseInt(userRes.rows[0].count),
      orders: parseInt(orderRes.rows[0].count),
      products: parseInt(productRes.rows[0].count),
      totalRevenue: parseFloat(revenueRes.rows[0].sum || 0)
    }
  });
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // جلب المستخدمين مع ترتيبهم من الأحدث للأقدم
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// @desc    Manage system settings (Placeholder)
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = asyncHandler(async (req, res, next) => {
  // يمكن هنا إضافة منطق لتحديث إعدادات عامة للموقع في قاعدة البيانات
  // حالياً نرسل رسالة نجاح وهمية
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully'
  });
});