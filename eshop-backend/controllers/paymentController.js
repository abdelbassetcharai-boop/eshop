const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Process payment for order
// @route   POST /api/payments
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  const { orderId, paymentMethod, amount } = req.body;

  // 1. التحقق من أن الطلب يخص المستخدم وحالته "قيد الانتظار"
  const orderCheck = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = $3',
    [orderId, req.user.id, 'pending']
  );

  if (orderCheck.rows.length === 0) {
    return next(new ErrorResponse('Order not found or already paid', 404));
  }

  // 2. محاكاة عملية الدفع (هنا يتم استدعاء Stripe/PayPal API في التطبيق الحقيقي)
  // نفترض نجاح العملية حالياً للتجربة
  const paymentStatus = 'completed';
  const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // --- بدء المعاملة (Transaction) لضمان تكامل البيانات ---
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // أ. تسجيل عملية الدفع في جدول المدفوعات
    const paymentQuery = `
      INSERT INTO payments (order_id, amount, provider, status, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const paymentResult = await client.query(paymentQuery, [orderId, amount, paymentMethod, paymentStatus, transactionId]);

    // ب. تحديث حالة الطلب إلى "مدفوع"
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', orderId]);

    await client.query('COMMIT'); // اعتماد التغييرات

    res.status(200).json({
      success: true,
      data: paymentResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK'); // التراجع في حال حدوث خطأ
    console.error('Payment Error:', err);
    next(new ErrorResponse('Payment processing failed', 500));
  } finally {
    client.release();
  }
});