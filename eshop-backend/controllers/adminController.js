const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// ... (الدوال الأخرى مثل getDashboardStats و getUsers تبقى كما هي، سنركز فقط على دوال الإعدادات والبائعين) ...

exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const userCountPromise = pool.query('SELECT COUNT(*) FROM users');
  const orderCountPromise = pool.query('SELECT COUNT(*) FROM orders');
  const productCountPromise = pool.query('SELECT COUNT(*) FROM products');
  const vendorCountPromise = pool.query('SELECT COUNT(*) FROM vendors');
  const adminRevenuePromise = pool.query("SELECT COALESCE(SUM(admin_commission), 0) as sum FROM order_items");

  const [userRes, orderRes, productRes, vendorRes, adminRevenueRes] = await Promise.all([
    userCountPromise,
    orderCountPromise,
    productCountPromise,
    vendorCountPromise,
    adminRevenuePromise
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: parseInt(userRes.rows[0].count),
      orders: parseInt(orderRes.rows[0].count),
      products: parseInt(productRes.rows[0].count),
      vendors: parseInt(vendorRes.rows[0].count),
      totalAdminRevenue: parseFloat(adminRevenueRes.rows[0].sum),
    }
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// --------------------------------------------------------------------------
// --- تصحيح دالة الإعدادات (Fix: Upsert Logic) ---
// --------------------------------------------------------------------------

// @desc    Manage system settings (Create or Update)
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSystemSettings = asyncHandler(async (req, res, next) => {
  // نفترض أنك ستضيف جدولاً اسمه system_settings
  // الأعمدة المتوقعة: id, site_name, currency, support_email, maintenance_mode

  const { siteName, currency, supportEmail, maintenanceMode } = req.body;

  // نحاول التحديث أولاً
  const updateQuery = `
    UPDATE system_settings
    SET site_name = $1, currency = $2, support_email = $3, maintenance_mode = $4
    WHERE id = 1
    RETURNING *
  `;

  let result = await pool.query(updateQuery, [siteName, currency, supportEmail, maintenanceMode]);

  // إذا لم يتم تحديث أي صف (الجدول فارغ)، نقوم بالإضافة
  if (result.rowCount === 0) {
    const insertQuery = `
      INSERT INTO system_settings (id, site_name, currency, support_email, maintenance_mode)
      VALUES (1, $1, $2, $3, $4)
      RETURNING *
    `;
    result = await pool.query(insertQuery, [siteName, currency, supportEmail, maintenanceMode]);
  }

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: result.rows[0]
  });
});

// -----------------------------------------------------
// --- دوال إدارة البائعين (Vendors) ---
// -----------------------------------------------------

exports.getVendorsList = asyncHandler(async (req, res, next) => {
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

exports.getPayoutRequests = asyncHandler(async (req, res, next) => {
  const query = `
    SELECT pr.*, v.store_name, v.balance, pr.vendor_id
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

exports.processPayout = asyncHandler(async (req, res, next) => {
  const { payoutId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query('SELECT * FROM payout_requests WHERE id = $1 FOR UPDATE', [payoutId]);
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return next(new ErrorResponse('Payout request not found', 404));
    }

    const updatedPayout = await client.query(
      "UPDATE payout_requests SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [payoutId]
    );

    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      message: 'Payout marked as completed',
      data: updatedPayout.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return next(new ErrorResponse('Failed to process payout', 500));
  } finally {
    client.release();
  }
});