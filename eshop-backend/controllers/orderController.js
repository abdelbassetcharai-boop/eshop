const pool = require('../config/database');

// إنشاء طلب جديد
const createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    // تم إضافة shipping_address كحقل يتم إدخاله مباشرة في جدول orders
    const { shipping_address, payment_method, shipping_cost = 0 } = req.body;

    if (!shipping_address || !payment_method) {
      return res.status(400).json({
        success: false,
        error: 'Shipping address and payment method are required'
      });
    }

    // البدء بعملية transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // جلب عربة المستخدم
      const cartResult = await client.query(`
        SELECT c.*, p.price, p.stock, p.name
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [user_id]);

      if (cartResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Cart is empty'
        });
      }

      // حساب المجموع الكلي
      let totalPrice = 0;
      const orderItems = [];

      for (const item of cartResult.rows) {
        // التحقق من المخزون
        if (item.stock < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `Not enough stock for ${item.name}`
          });
        }

        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal
        });
      }

      // إضافة تكلفة الشحن إلى المجموع الكلي
      const finalPrice = totalPrice + parseFloat(shipping_cost);

      // إنشاء الطلب
      const orderResult = await client.query(
        `INSERT INTO orders (user_id, total_price, status, shipping_address)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [user_id, finalPrice, 'pending', shipping_address] // إضافة shipping_address
      );

      const order = orderResult.rows[0];

      // إضافة عناصر الطلب
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.product_id, item.quantity, item.price]
        );

        // تحديث المخزون
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // إنشاء سجل الدفع - (تم إزالة shipping_address و shipping_status)
      await client.query(
        `INSERT INTO payments (order_id, payment_method, payment_status, amount)
         VALUES ($1, $2, $3, $4)`,
        [order.id, payment_method, 'pending', finalPrice]
      );

      // تفريغ العربة
      await client.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: {
          ...order,
          items: orderItems,
          total_price_including_shipping: finalPrice
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// عرض طلبات المستخدم (بقية الدوال كما هي...)
const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const ordersResult = await pool.query(`
      SELECT
        o.*,
        p.payment_method,
        p.payment_status,
        p.shipping_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [user_id]);

    res.json({
      success: true,
      orders: ordersResult.rows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// عرض طلب محدد (بقية الدوال كما هي...)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // الحصول على بيانات الطلب
    const orderResult = await pool.query(`
      SELECT
        o.*,
        p.payment_method,
        p.payment_status,
        p.shipping_status,
        p.tracking_number
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = $1 AND o.user_id = $2
    `, [id, user_id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // الحصول على عناصر الطلب
    const itemsResult = await pool.query(`
      SELECT
        oi.*,
        p.name,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.json({
      success: true,
      order: {
        ...orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};


// إلغاء الطلب (المستخدم) - تم تعديل هذا الجزء لإضافة استعادة المخزون
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. تحديث حالة الطلب إلى 'cancelled'
      const result = await client.query(
        // يسمح بالإلغاء فقط إذا كانت الحالة 'pending'
        `UPDATE orders SET status = 'cancelled'
         WHERE id = $1 AND user_id = $2 AND status = 'pending'
         RETURNING *`,
        [id, user_id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Order not found or cannot be cancelled (status must be pending)'
        });
      }

      // 2. جلب عناصر الطلب التي تم إلغاؤها
      const itemsResult = await client.query(`
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id = $1
      `, [id]);

      // 3. استعادة المخزون
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // 4. تحديث سجل الدفع
      await client.query(
        `UPDATE payments SET payment_status = 'refund_pending'
         WHERE order_id = $1`,
        [id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Order cancelled and stock restored successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};