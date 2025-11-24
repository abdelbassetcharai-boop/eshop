const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  // orderItems حالياً هو مجرد قائمة بمعرفات المنتجات والكميات من الفرونت إند
  const { orderItems: cartItemsFromClient, shippingAddressId, totalAmount } = req.body;
  const userId = req.user.id;

  const ADMIN_COMMISSION_RATE = 0.10; // نسبة عمولة المدير (10%) - يمكن جلبها من جدول الإعدادات لاحقاً

  if (!cartItemsFromClient || cartItemsFromClient.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }

  // --- START TRANSACTION ---
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. جلب تفاصيل المنتجات الكاملة (السعر، المخزون، البائع) من قاعدة البيانات
    const productIds = cartItemsFromClient.map(item => item.product_id);
    const productsDetailsQuery = `
      SELECT id, price, stock, vendor_id
      FROM products
      WHERE id = ANY($1::int[])
    `;
    const productDetailsResult = await client.query(productsDetailsQuery, [productIds]);
    const productMap = productDetailsResult.rows.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    let calculatedTotal = 0;
    const finalOrderItems = [];

    // 2. التحقق من الأسعار والمخزون وحساب العمولات
    for (const item of cartItemsFromClient) {
      const product = productMap[item.product_id];
      const quantity = item.quantity;

      if (!product || product.stock < quantity) {
          // التراجع عن المعاملة وإرسال رسالة خطأ
          await client.query('ROLLBACK');
          client.release();
          return next(new ErrorResponse(`Product ${item.product_id} is out of stock or quantity exceeds available stock.`, 400));
      }

      // التأكد من أن السعر لم يتغير عن الموجود في قاعدة البيانات
      if (Number(item.price) !== Number(product.price)) {
          // التراجع وإرسال رسالة خطأ
          await client.query('ROLLBACK');
          client.release();
          return next(new ErrorResponse('Prices have been updated. Please refresh your cart.', 400));
      }

      const itemPrice = Number(product.price);
      const subtotal = itemPrice * quantity;
      calculatedTotal += subtotal;

      // حساب العمولة
      const adminCommission = subtotal * ADMIN_COMMISSION_RATE;
      const vendorNetRevenue = subtotal - adminCommission; // صافي ربح البائع

      finalOrderItems.push({
          ...item,
          vendor_id: product.vendor_id,
          price: itemPrice,
          admin_commission: adminCommission,
          vendor_revenue: vendorNetRevenue,
          subtotal: subtotal,
      });

      // خصم المخزون
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [quantity, item.product_id]
      );
    }

    // (اختياري) التحقق من أن مجموع السلة المرسل من العميل يطابق المجموع المحسوب في الباك إند
    // يفترض هنا أن totalAmount المرسل من العميل يشمل الشحن والضريبة، لذا يجب حسابها هنا أيضاً والمطابقة

    // 3. إنشاء سجل الطلب الأساسي (Order Header)
    // نستخدم calculatedTotal (مجموع المنتجات فقط) هنا، إذا كان totalAmount من العميل يشمل الشحن والضريبة، يجب تعديل OrderTable لاستيعابها
    const orderQuery = `
      INSERT INTO orders (user_id, total_amount, status, shipping_address_id)
      VALUES ($1, $2, 'pending', $3)
      RETURNING id, created_at
    `;
    const orderResult = await client.query(orderQuery, [userId, totalAmount, shippingAddressId]); // نستخدم totalAmount المرسل من الفرونت إند لاحترام سياق الدفع
    const orderId = orderResult.rows[0].id;

    // 4. إدراج المنتجات داخل الطلب (Order Items)
    // يتم تسجيل حصة كل طرف هنا
    const itemQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price, vendor_id, admin_commission, vendor_revenue)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const item of finalOrderItems) {
      await client.query(itemQuery, [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
        item.vendor_id, // تحديد البائع
        item.admin_commission, // عمولة المدير
        item.vendor_revenue   // صافي ربح البائع
      ]);
    }

    // 5. مسح السلة بعد إنشاء الطلب بنجاح
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // 6. اعتماد المعاملة
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        id: orderId,
        status: 'pending',
        items_count: finalOrderItems.length,
        created_at: orderResult.rows[0].created_at
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', err);
    // إذا كان الخطأ هو خطأ استجابة مخصص، نمرره كما هو، وإلا خطأ داخلي
    if (err instanceof ErrorResponse) {
        return next(err);
    }
    return next(new ErrorResponse('Order creation failed', 500));
  } finally {
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
  const orderQuery = 'SELECT * FROM orders WHERE id = $1';
  const orderResult = await pool.query(orderQuery, [req.params.id]);

  const order = orderResult.rows[0];

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // 2. التحقق من الصلاحية: يجب أن يكون المستخدم هو صاحب الطلب أو أدمن أو بائع لأحد منتجات الطلب
  const isOrderOwner = order.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOrderOwner && !isAdmin) {
      // التحقق مما إذا كان المستخدم بائع لأي من المنتجات في هذا الطلب
      const vendorCheckQuery = `
          SELECT EXISTS(
              SELECT 1 FROM order_items
              WHERE order_id = $1 AND vendor_id = $2
          )
      `;
      const vendorCheckResult = await pool.query(vendorCheckQuery, [order.id, req.user.id]);
      const isVendorForOrder = vendorCheckResult.rows[0].exists;

      if (!isVendorForOrder) {
        return next(new ErrorResponse('Not authorized to view this order', 403));
      }
  }

  // 3. جلب المنتجات المرتبطة بالطلب
  // يتم جلب جميع تفاصيل المنتجات بما فيها بيانات العمولات (Order Items)
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
// @access  Private/Admin or Private/Vendor
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id: orderId } = req.params;

  // 1. التحقق من الصلاحية
  if (req.user.role === 'customer') {
      return next(new ErrorResponse('Not authorized to update order status', 403));
  }

  // 2. إذا كان المستخدم بائع، يجب أن يتأكد أنه يملك منتج في هذا الطلب
  if (req.user.role === 'vendor') {
      const vendorCheckQuery = `
          SELECT EXISTS(
              SELECT 1 FROM order_items
              WHERE order_id = $1 AND vendor_id = $2
          )
      `;
      const vendorCheckResult = await pool.query(vendorCheckQuery, [orderId, req.user.id]);
      if (!vendorCheckResult.rows[0].exists) {
           return next(new ErrorResponse('Vendor cannot update orders not related to their products', 403));
      }

      // ملاحظة للبائع: البائع يغير حالة الشحن (Shipped, Delivered) وليس حالة الدفع (Paid)
      const allowedVendorStatuses = ['shipped', 'delivered', 'cancelled'];
      if (!allowedVendorStatuses.includes(status)) {
         return next(new ErrorResponse('Vendor can only set status to shipped, delivered, or cancelled', 400));
      }
  }

  // 3. التحديث الفعلي للحالة
  const result = await pool.query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, orderId]
  );

  if (result.rows.length === 0) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: result.rows[0]
  });
});