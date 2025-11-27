const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// ... (بقية الدوال: getUsers, getVendorsList, approveVendor, getPayoutRequests, processPayout, getStoreSettings, updateStoreSettings, getAllPayments تبقى كما هي) ...

exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  // تعريف الوعود (Promises)
  const userCountPromise = pool.query('SELECT COUNT(*) FROM users');
  const orderCountPromise = pool.query('SELECT COUNT(*) FROM orders');
  const productCountPromise = pool.query('SELECT COUNT(*) FROM products');
  const vendorCountPromise = pool.query('SELECT COUNT(*) FROM vendors');
  const adminRevenuePromise = pool.query("SELECT COALESCE(SUM(admin_commission), 0) as sum FROM order_items");

  // تنفيذ الاستعلامات بشكل متوازي
  const [userRes, orderRes, productRes, vendorRes, adminRevenueRes] = await Promise.all([
    userCountPromise,
    orderCountPromise,
    productCountPromise,
    vendorCountPromise,
    adminRevenuePromise
  ]);

  // إرسال الرد (تم التأكد من تطابق أسماء المتغيرات)
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

// ... (بقية الدوال في الملف، تأكد من نسخها جميعاً أو الإبقاء عليها) ...
// سأعيد كتابة باقي الدوال المهمة هنا للتأكد من أن الملف كامل وصحيح

exports.getUsers = asyncHandler(async (req, res, next) => {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.getVendorsList = asyncHandler(async (req, res, next) => {
  const query = `SELECT v.*, u.name, u.email, u.created_at AS user_since FROM vendors v JOIN users u ON v.user_id = u.id ORDER BY v.created_at DESC`;
  const result = await pool.query(query);
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.approveVendor = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const result = await pool.query("UPDATE vendors SET is_approved = true WHERE user_id = $1 RETURNING *", [userId]);
  if (result.rows.length === 0) return next(new ErrorResponse(`Vendor not found`, 404));
  res.status(200).json({ success: true, message: 'Vendor approved', data: result.rows[0] });
});

exports.getPayoutRequests = asyncHandler(async (req, res, next) => {
  const query = `SELECT pr.*, v.store_name, v.balance, pr.vendor_id FROM payout_requests pr JOIN vendors v ON pr.vendor_id = v.user_id WHERE pr.status = 'pending' ORDER BY pr.created_at ASC`;
  const result = await pool.query(query);
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.processPayout = asyncHandler(async (req, res, next) => {
  const { payoutId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatedPayout = await client.query("UPDATE payout_requests SET status = 'completed', processed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *", [payoutId]);
    if (updatedPayout.rows.length === 0) throw new Error('Payout request not found');
    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Payout completed', data: updatedPayout.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    return next(new ErrorResponse('Failed to process payout', 500));
  } finally {
    client.release();
  }
});

exports.getStoreSettings = asyncHandler(async (req, res, next) => {
    const result = await pool.query('SELECT key, value FROM system_configs');
    const settings = result.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
    }, {});
    res.status(200).json({ success: true, data: settings });
});

exports.updateStoreSettings = asyncHandler(async (req, res, next) => {
    const settings = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const upsertQuery = `
        INSERT INTO system_configs (key, value, type, description)
        VALUES ($1, $2, 'text', 'Store Config')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
      `;

      const promises = Object.keys(settings).map(key => {
        let valueToStore = settings[key];
        if (typeof valueToStore === 'object') {
            valueToStore = JSON.stringify(valueToStore);
        } else {
            valueToStore = String(valueToStore);
        }
        return client.query(upsertQuery, [key, valueToStore]);
      });

      await Promise.all(promises);
      await client.query('COMMIT');
      res.status(200).json({ success: true, message: 'Store settings updated successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      return next(new ErrorResponse('Failed to update settings', 500));
    } finally {
      client.release();
    }
});

exports.getAllPayments = asyncHandler(async (req, res, next) => {
  const query = `
    SELECT
      p.id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.transaction_id,
      p.created_at,
      o.id as order_id,
      u.name as customer_name,
      u.email as customer_email
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN users u ON o.user_id = u.id
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query(query);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});