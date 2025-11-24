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
  const vendorCountPromise = pool.query('SELECT COUNT(*) FROM vendors'); // جلب عدد البائعين

  // حساب مجموع الإيرادات (عمولة المدير) - نستخدم COALESCE لضمان أن SUM(null) يعطي 0
  const adminRevenuePromise = pool.query("SELECT COALESCE(SUM(admin_commission), 0) as sum FROM order_items");

  const [userRes, orderRes, productRes, vendorRes, adminRevenueRes] = await Promise.all([
    userCountPromise,
    orderCountPromise,
    productCountPromise,
    vendorCountPromise,
    adminRevenuePromise
  ]);

  // تحويل جميع القيم إلى أرقام عشرية قبل الإرسال
  const totalAdminRevenue = parseFloat(adminRevenueRes.rows[0].sum);

  res.status(200).json({
    success: true,
    data: {
      users: parseInt(userRes.rows[0].count),
      orders: parseInt(orderRes.rows[0].count),
      products: parseInt(productRes.rows[0].count),
      vendors: parseInt(vendorRes.rows[0].count),
      // إرسالها كرقم معالج مسبقًا
      totalAdminRevenue: totalAdminRevenue,
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
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully'
  });
});

// -----------------------------------------------------
// --- دوال إدارة البائعين (Vendors) ---
// -----------------------------------------------------

// @desc    Get all vendors list
// @route   GET /api/admin/vendors
// @access  Private/Admin
exports.getVendorsList = asyncHandler(async (req, res, next) => {
  // جلب البائعين مع بيانات المستخدم المرتبطة بهم
  const query = `
    SELECT v.*, u.name, u.email, u.created_at AS user_since
    FROM vendors v
    JOIN users u ON v.user_id = u.id
    ORDER BY v.created_at DESC
  `;
  const result = await pool.query(query);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// @desc    Approve a vendor account
// @route   PUT /api/admin/vendors/:userId/approve
// @access  Private/Admin
exports.approveVendor = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const result = await pool.query(
    "UPDATE vendors SET is_approved = true WHERE user_id = $1 RETURNING *",
    [userId]
  );

  if (result.rows.length === 0) {
    return next(new ErrorResponse(`Vendor with user ID ${userId} not found`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'Vendor approved successfully',
    data: result.rows[0]
  });
});

// -----------------------------------------------------
// --- دوال إدارة المدفوعات (Payouts) ---
// -----------------------------------------------------

// @desc    Get all pending payout requests
// @route   GET /api/admin/payouts
// @access  Private/Admin
exports.getPayoutRequests = asyncHandler(async (req, res, next) => {
  // جلب طلبات السحب المعلقة مع اسم المتجر المرتبط
  const query = `
    SELECT pr.*, v.store_name, v.balance
    FROM payout_requests pr
    JOIN vendors v ON pr.vendor_id = v.user_id
    WHERE pr.status = 'pending'
    ORDER BY pr.created_at ASC
  `;
  const result = await pool.query(query);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});


// @desc    Process a payout request (mark as completed)
// @route   PUT /api/admin/payouts/:payoutId/process
// @access  Private/Admin
exports.processPayout = asyncHandler(async (req, res, next) => {
  const { payoutId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. جلب الطلب للتأكد من حالته
    const requestResult = await client.query('SELECT * FROM payout_requests WHERE id = $1 FOR UPDATE', [payoutId]);

    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return next(new ErrorResponse('Payout request not found', 404));
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      await client.query('ROLLBACK');
      client.release();
      return next(new ErrorResponse(`Payout request already processed with status: ${request.status}`, 400));
    }

    // 2. تحديث حالة الطلب إلى مكتمل
    const updatedPayout = await client.query(
      "UPDATE payout_requests SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [payoutId]
    );

    // ملاحظة هامة: تم خصم المبلغ من رصيد البائع في مرحلة requestPayout
    // هنا يتم فقط تسجيل العملية كـ "مكتملة".

    await client.query('COMMIT');
    client.release();

    res.status(200).json({
      success: true,
      message: 'Payout successfully processed (marked as completed)',
      data: updatedPayout.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Process Payout Error:', err);
    return next(new ErrorResponse('Failed to process payout', 500));
  }
});