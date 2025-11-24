const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get vendor dashboard statistics
// @route   GET /api/vendor/stats
// @access  Private/Vendor (Approved)
exports.getVendorStats = asyncHandler(async (req, res, next) => {
  const vendorId = req.user.id;

  // 1. جلب معلومات البائع الأساسية (الاسم، الرصيد، حالة الاعتماد)
  const vendorInfoPromise = pool.query('SELECT store_name, balance, is_approved FROM vendors WHERE user_id = $1', [vendorId]);

  // 2. إجمالي المبيعات (من order_items) - يجب أن تكون حالة الطلب "مدفوع" أو أعلى
  const totalSalesPromise = pool.query(`
    SELECT SUM(oi.vendor_revenue) AS total_revenue, COUNT(oi.id) AS total_items_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.vendor_id = $1 AND o.status IN ('paid', 'shipped', 'delivered')
  `, [vendorId]);

  // 3. عدد الطلبات المعلقة التي تحتاج إلى شحن (حالة الطلب: Paid)
  const pendingOrdersPromise = pool.query(`
    SELECT COUNT(DISTINCT oi.order_id)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.vendor_id = $1 AND o.status = 'paid'
  `, [vendorId]);

  const [vendorInfoRes, totalSalesRes, pendingOrdersRes] = await Promise.all([
    vendorInfoPromise,
    totalSalesPromise,
    pendingOrdersPromise
  ]);

  const vendorInfo = vendorInfoRes.rows[0];
  const salesStats = totalSalesRes.rows[0];

  if (!vendorInfo) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      storeName: vendorInfo.store_name,
      isApproved: vendorInfo.is_approved,
      currentBalance: parseFloat(vendorInfo.balance || 0).toFixed(2),
      totalRevenue: parseFloat(salesStats.total_revenue || 0).toFixed(2),
      itemsSold: parseInt(salesStats.total_items_sold || 0),
      pendingShipments: parseInt(pendingOrdersRes.rows[0].count),
    }
  });
});

// @desc    Get all orders/items relevant to the vendor
// @route   GET /api/vendor/orders
// @access  Private/Vendor (Approved)
exports.getVendorOrders = asyncHandler(async (req, res, next) => {
  const vendorId = req.user.id;

  // جلب الطلبات الفرعية الخاصة بهذا البائع فقط
  const query = `
    SELECT
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        oi.vendor_revenue,
        o.total_amount,
        o.status AS order_status,
        o.created_at,
        u.name AS customer_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN users u ON o.user_id = u.id
    WHERE oi.vendor_id = $1
    ORDER BY o.created_at DESC
  `;

  const result = await pool.query(query, [vendorId]);

  // ملاحظة: يمكن هنا تجميع items حسب order_id في الباك إند إذا كانت الواجهة تحتاج تجميع الطلبات
  // لكن للتبسيط ولتسهيل رؤية البائع لمنتجاته الفردية، نكتفي بإرجاع قائمة عناصر الطلب.

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Request a payout (withdraw funds)
// @route   POST /api/vendor/payouts
// @access  Private/Vendor (Approved)
exports.requestPayout = asyncHandler(async (req, res, next) => {
  const { amount, notes } = req.body;
  const vendorId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. جلب الرصيد الحالي للبائع
    const balanceResult = await client.query('SELECT balance FROM vendors WHERE user_id = $1 FOR UPDATE', [vendorId]);
    const currentBalance = parseFloat(balanceResult.rows[0].balance || 0);

    if (currentBalance < amount) {
      // التراجع لعدم إغلاق الاتصال
      await client.query('ROLLBACK');
      client.release();
      return next(new ErrorResponse('Requested amount exceeds current available balance', 400));
    }

    // 2. خصم المبلغ من رصيد البائع
    const newBalance = currentBalance - amount;
    await client.query('UPDATE vendors SET balance = $1 WHERE user_id = $2', [newBalance, vendorId]);

    // 3. إنشاء سجل طلب السحب
    const payoutQuery = `
      INSERT INTO payout_requests (vendor_id, amount, status, admin_note)
      VALUES ($1, $2, 'pending', $3)
      RETURNING *
    `;
    const payoutResult = await client.query(payoutQuery, [vendorId, amount, notes]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully and is pending admin approval',
      data: payoutResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payout Request Error:', err);
    return next(new ErrorResponse('Failed to process payout request', 500));
  } finally {
    client.release();
  }
});

// @desc    Get vendor payout history
// @route   GET /api/vendor/payouts
// @access  Private/Vendor (Approved)
exports.getPayoutHistory = asyncHandler(async (req, res, next) => {
  const vendorId = req.user.id;

  const query = 'SELECT * FROM payout_requests WHERE vendor_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [vendorId]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});