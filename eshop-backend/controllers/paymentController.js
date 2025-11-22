const pool = require('../config/database');

// إنشاء عملية دفع
const createPaymentIntent = async (req, res) => {
  try {
    const { order_id, payment_method, amount } = req.body;

    // في بيئة الإنتاج، هنا تتصل ببوابة الدفع (مثل Stripe, PayPal)
    const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ملاحظة: تم تعديل اسم الجدول من payment_transactions إلى payments
    const result = await pool.query(
      `INSERT INTO payments -- الجدول الصحيح
       (order_id, payment_method, transaction_id, amount, payment_status) -- تم تعديل status إلى payment_status
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, payment_method, transaction_id, amount, 'pending']
    );

    res.json({
      success: true,
      payment_intent: {
        id: result.rows[0].id,
        transaction_id: result.rows[0].transaction_id,
        client_secret: `pi_${transaction_id}_secret` // في الواقع سترجع من بوابة الدفع
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing error'
    });
  }
};

// تأكيد الدفع
const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body; // هو في الواقع transaction_id هنا

    // ملاحظة: تم تعديل اسم الجدول من payment_transactions إلى payments
    const result = await pool.query(
      `UPDATE payments -- الجدول الصحيح
       SET payment_status = 'completed'
       WHERE transaction_id = $1
       RETURNING *`,
      [payment_intent_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // تحديث حالة الطلب
    // يجب أن يكون تحديث حالة الطلب من 'pending' إلى 'processing' بعد تأكيد الدفع
    await pool.query(
      `UPDATE orders SET status = 'processing'
       WHERE id = $1`,
      [result.rows[0].order_id]
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order_id: result.rows[0].order_id // إضافة ID الطلب في الرد
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment confirmation error'
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment
};