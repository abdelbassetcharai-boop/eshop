const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Process payment for order
// @route   POST /api/payments
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
  // نستقبل طريقة الدفع ومعرف المعاملة (إذا كان دفع إلكتروني قادم من الفرونت إند)
  const { orderId, paymentMethod, transactionId } = req.body;

  // 1. التحقق من وجود الطلب وأنه يخص المستخدم وحالته "قيد الانتظار"
  const orderCheck = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, req.user.id]
  );

  if (orderCheck.rows.length === 0) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const order = orderCheck.rows[0];

  if (order.status !== 'pending') {
    return next(new ErrorResponse('Order is already paid or processed', 400));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let finalStatus = 'pending';
    let finalPaymentStatus = 'pending';
    let finalTransactionId = transactionId || `cod_${Date.now()}`;

    // --- معالجة أنواع الدفع المختلفة ---

    if (paymentMethod === 'cod') {
      // الحالة: الدفع عند الاستلام
      // لا نغير حالة الطلب إلى 'paid' فوراً، بل تبقى 'pending' ولكن نثبت طريقة الدفع
      finalStatus = 'pending';
      finalPaymentStatus = 'pending';
      finalTransactionId = `COD-${orderId}-${Date.now()}`;

    } else if (paymentMethod === 'credit_card' || paymentMethod === 'paypal') {
      // الحالة: دفع إلكتروني
      // نفترض أن الفرونت إند قام بالدفع عبر Stripe/PayPal وأرسل لنا transactionId
      if (!transactionId) {
        throw new Error('Transaction ID is missing for online payment');
      }

      // هنا نعتبر الدفع ناجحاً بناءً على توكيد الفرونت إند (في بيئة الإنتاج الحقيقية يجب التحقق من التوكن مع Stripe backend)
      finalStatus = 'paid';
      finalPaymentStatus = 'completed';
    } else {
      throw new Error('Invalid payment method');
    }

    // 2. تسجيل عملية الدفع في جدول المدفوعات
    const paymentQuery = `
      INSERT INTO payments (order_id, amount, provider, status, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const paymentResult = await client.query(paymentQuery, [
      orderId,
      order.total_amount,
      paymentMethod,
      finalPaymentStatus,
      finalTransactionId
    ]);

    // 3. تحديث حالة الطلب
    // إذا كان دفع إلكتروني ناجح -> نحول الطلب إلى Paid
    // إذا كان عند الاستلام -> نتركه Pending أو نحوله لحالة مخصصة مثل 'processing'
    const newOrderStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [newOrderStatus, orderId]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: paymentMethod === 'cod' ? 'Order placed successfully (Cash on Delivery)' : 'Payment processed successfully',
      data: paymentResult.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment Error:', err);
    return next(new ErrorResponse(err.message || 'Payment processing failed', 500));
  } finally {
    client.release();
  }
});