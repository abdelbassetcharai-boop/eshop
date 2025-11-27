const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// التحقق من وجود مفتاح Stripe
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY missing. Stripe payments will fail.");
}

// @desc    Create Payment Intent (Stripe)
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  if (!stripe) {
      return next(new ErrorResponse('Stripe service is not configured on the server', 500));
  }

  const { orderId } = req.body;

  // 1. جلب بيانات الطلب
  const orderResult = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
    [orderId, req.user.id]
  );

  if (orderResult.rows.length === 0) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const order = orderResult.rows[0];

  // 2. التأكد من صحة المبلغ
  // ملاحظة: قد يكون اسم العمود total_price أو total_amount حسب التعديلات السابقة
  const totalAmount = Number(order.total_price || order.total_amount);

  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return next(new ErrorResponse('Invalid order amount', 400));
  }

  // Stripe يتعامل بالسنت (مثلاً 10.50 دولار = 1050 سنت)
  const amountInCents = Math.round(totalAmount * 100);

  try {
    // 3. إنشاء نية الدفع
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd', // يمكنك تغييرها إلى 'sar' أو 'mad' إذا كان حساب Stripe يدعم ذلك
      metadata: {
        orderId: order.id,
        userId: req.user.id
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe Create Intent Error:', error);
    return next(new ErrorResponse(error.message || 'Payment initialization failed', 500));
  }
});

// @desc    Confirm Payment & Update Order
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { orderId, paymentIntentId, paymentMethod } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let transactionId = paymentIntentId;
    let paymentStatus = 'completed';

    // التحقق من Stripe
    if (paymentMethod === 'stripe') {
        if (!stripe) throw new Error('Stripe not configured');

        if (!paymentIntentId) throw new Error('Missing Payment Intent ID');

        // التحقق من حالة الدفع من Stripe مباشرة للأمان
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Payment not succeeded. Status: ${paymentIntent.status}`);
        }
        transactionId = paymentIntent.id;
    } else if (paymentMethod === 'cod') {
        paymentStatus = 'pending';
        transactionId = `cod_${Date.now()}`;
    }

    // 1. تحديث حالة الطلب
    const orderStatus = paymentMethod === 'stripe' ? 'paid' : 'pending';
    const updateOrderQuery = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const orderRes = await client.query(updateOrderQuery, [orderStatus, orderId]);

    if (orderRes.rows.length === 0) {
         throw new Error('Order not found during update');
    }

    const order = orderRes.rows[0];

    // 2. إدراج السجل في جدول المدفوعات
    const insertPaymentQuery = `
      INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // استخدام total_price أو total_amount بناءً على ما هو متاح
    const amount = order.total_price || order.total_amount;

    await client.query(insertPaymentQuery, [
        orderId,
        amount,
        paymentMethod,
        paymentStatus,
        transactionId
    ]);

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Confirmation Error:', error);
    return next(new ErrorResponse(error.message, 500));
  } finally {
    client.release();
  }
});