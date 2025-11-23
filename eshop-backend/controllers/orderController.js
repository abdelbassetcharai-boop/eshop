const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingAddressId, totalAmount } = req.body;
  const userId = req.user.id;

  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }

  // --- START TRANSACTION (بدء المعاملة) ---
  // نستخدم client بدلاً من pool لضمان أن جميع الاستعلامات تتم في نفس الجلسة
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // بداية الكتلة الآمنة

    // 1. إنشاء سجل الطلب الأساسي (Order Header)
    // الحالة الافتراضية 'pending' (قيد الانتظار للدفع)
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, status)
      VALUES ($1, $2, 'pending')
      RETURNING id, created_at
    `;
    const orderResult = await client.query(orderQuery, [userId, totalAmount]);
    const orderId = orderResult.rows[0].id;

    // 2. إدراج المنتجات داخل الطلب (Order Items)
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of orderItems) {
      // ملاحظة: في تطبيق حقيقي، يجب هنا التحقق من توفر المخزون (Stock) وخصمه
      // وأيضاً التحقق من أن السعر المرسل يطابق السعر في قاعدة البيانات
      await client.query(itemQuery, [orderId, item.product_id, item.quantity, item.price]);
    }

    // 3. اعتماد المعاملة (حفظ التغييرات نهائياً)
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        status: 'pending',
        items_count: orderItems.length,
        created_at: orderResult.rows[0].created_at
      }
    });

  } catch (err) {
    // في حال حدوث أي خطأ، التراجع عن جميع العمليات السابقة
    await client.query('ROLLBACK');
    console.error('Transaction Error:', err);
    return next(new ErrorResponse('Order creation failed', 500));
  } finally {
    // تحرير العميل ليعود للمجمع
    client.release();
  }
  // --- END TRANSACTION ---
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const query = `
    SELECT * FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [req.user.id]);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
  // 1. جلب تفاصيل الطلب
  const query = 'SELECT * FROM orders WHERE id = $1';
  const result = await pool.query(query, [req.params.id]);

  const order = result.rows[0];

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // 2. التحقق من الصلاحية: يجب أن يكون المستخدم هو صاحب الطلب أو أدمن
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  // 3. جلب المنتجات المرتبطة بالطلب
  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  order.items = itemsResult.rows;

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
  // يمكن تحسين هذا الاستعلام لاحقاً ليشمل اسم المستخدم (JOIN users)
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // e.g. 'shipped', 'delivered'

  const result = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, req.params.id]
  );

  if (result.rows.length === 0) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});