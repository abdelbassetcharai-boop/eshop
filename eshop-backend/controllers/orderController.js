const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems: cartItemsFromClient, shippingAddressId } = req.body;
  const userId = req.user.id;
  const ADMIN_COMMISSION_RATE = 0.10;

  if (!cartItemsFromClient || cartItemsFromClient.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. جلب العنوان وحفظه كنص
    const addressRes = await client.query('SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2', [shippingAddressId, userId]);
    if (addressRes.rows.length === 0) throw new Error('Shipping address not found');
    const addr = addressRes.rows[0];
    const shippingAddressText = `${addr.address || addr.address_line1}, ${addr.city}, ${addr.country}`;

    // 2. معالجة المنتجات
    const productIds = cartItemsFromClient.map(item => item.product_id);
    const productsDetailsQuery = `SELECT id, price, stock, vendor_id FROM products WHERE id = ANY($1::int[])`;
    const productDetailsResult = await client.query(productsDetailsQuery, [productIds]);
    const productMap = productDetailsResult.rows.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    let calculatedTotal = 0;
    const finalOrderItems = [];

    for (const item of cartItemsFromClient) {
      const product = productMap[item.product_id];
      if (!product || product.stock < item.quantity) throw new Error(`Product ${item.product_id} out of stock`);

      const itemPrice = Number(product.price);
      const subtotal = itemPrice * item.quantity;
      calculatedTotal += subtotal;

      const adminCommission = subtotal * ADMIN_COMMISSION_RATE;
      const vendorCommission = subtotal - adminCommission;

      finalOrderItems.push({
          ...item,
          vendor_id: product.vendor_id,
          price: itemPrice,
          vendor_commission: vendorCommission,
          admin_commission: adminCommission
      });

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    // 3. إنشاء الطلب (استخدام total_price و shipping_address)
    const orderQuery = `
      INSERT INTO orders (user_id, total_price, status, shipping_address)
      VALUES ($1, $2, 'pending', $3)
      RETURNING id, total_price, created_at
    `;
    const orderResult = await client.query(orderQuery, [userId, calculatedTotal, shippingAddressText]);
    const newOrder = orderResult.rows[0];

    // 4. إدراج العناصر
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price, vendor_commission, admin_commission)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const item of finalOrderItems) {
      await client.query(itemQuery, [
        newOrder.id, item.product_id, item.quantity, item.price, item.vendor_commission, item.admin_commission
      ]);
    }

    await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    await client.query('COMMIT');

    sendOrderConfirmationEmail(req.user, newOrder, shippingAddressText).catch(console.error);

    res.status(201).json({
      success: true,
      data: { id: newOrder.id, status: 'pending', total_price: newOrder.total_price }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    return next(new ErrorResponse(err.message || 'Order failed', 500));
  } finally {
    client.release();
  }
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [req.user.id]);
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (orderResult.rows.length === 0) return next(new ErrorResponse('Order not found', 404));
  const order = orderResult.rows[0];
  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  order.items = itemsResult.rows;
  res.status(200).json({ success: true, data: order });
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;
  const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
  if (result.rows.length === 0) return next(new ErrorResponse('Order not found', 404));
  res.status(200).json({ success: true, data: result.rows[0] });
});