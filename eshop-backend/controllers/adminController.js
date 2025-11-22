const pool = require('../config/database');

// إحصائيات الموقع
const getDashboardStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // ملاحظة: إذا كان المستخدم بائعاً، يجب تصفية الإحصائيات لمنتجاته وطلباته فقط.

    let vendorCondition = '';
    let adminStatsQueries = [
      pool.query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'vendor' THEN 1 END) as vendors,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
        FROM users
      `),
      pool.query(`
        SELECT
          COUNT(*) as total_products,
          SUM(stock) as total_stock,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock
        FROM products
      `),
      pool.query(`
        SELECT
          COUNT(*) as total_orders,
          SUM(total_price) as total_revenue,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
        FROM orders
      `)
    ];

    if (userRole === 'vendor') {
      vendorCondition = ` JOIN order_items oi ON o.id = oi.order_id
                          JOIN products p ON oi.product_id = p.id
                          WHERE p.vendor_id = ${userId} `;

      // تخصيص الإحصائيات للبائعين
      adminStatsQueries = [
        // لا حاجة لإحصائيات المستخدمين كاملة
        Promise.resolve({ rows: [{ total_users: 0, customers: 0, vendors: 1, admins: 0 }] }),
        pool.query(`
          SELECT
            COUNT(*) as total_products,
            SUM(stock) as total_stock,
            COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock
          FROM products
          WHERE vendor_id = $1
        `, [userId]),
        pool.query(`
          SELECT
            COUNT(DISTINCT o.id) as total_orders,
            SUM(oi.quantity * oi.price) as vendor_revenue,
            COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
            COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          WHERE p.vendor_id = $1
        `, [userId])
      ];
    }

    const [
      usersStatsResult,
      productsStatsResult,
      ordersStatsResult
    ] = await Promise.all(adminStatsQueries);

    // آخر الطلبات (للجميع أو للبائع فقط)
    const recentOrdersQuery = `
      SELECT
        o.*,
        u.name as user_name,
        p.payment_status,
        p.shipping_status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      ${userRole === 'vendor' ? vendorCondition.replace('o.id = oi.order_id', 'o.id = oi.order_id AND p.vendor_id = $1') : ''}
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    const recentOrders = await pool.query(recentOrdersQuery, userRole === 'vendor' ? [userId] : []);

    res.json({
      success: true,
      stats: {
        users: usersStatsResult.rows[0],
        products: productsStatsResult.rows[0],
        orders: ordersStatsResult.rows[0],
        recent_orders: recentOrders.rows
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// إدارة المستخدمين (للمشرف فقط - لا تغيير)
const getUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
     return res.status(403).json({ success: false, error: 'Admin access required for user management' });
  }
  // ... بقية المنطق كما هو
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*)
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      countQuery += ` AND role = $${paramCount}`;
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const usersResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, role ? [role] : []);

    res.json({
      success: true,
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تحديث دور المستخدم (للمشرف فقط - لا تغيير)
const updateUserRole = async (req, res) => {
  if (req.user.role !== 'admin') {
     return res.status(403).json({ success: false, error: 'Admin access required for role update' });
  }
  // ... بقية المنطق كما هو
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // منع المستخدم من تغيير دوره بنفسه
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// إدارة جميع الطلبات (محدث: تصفية للبائعين)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userRole = req.user.role;
    const userId = req.user.id;

    // البائعين يمكنهم رؤية الطلبات المتعلقة بمنتجاتهم فقط
    let vendorJoin = '';
    let vendorWhere = '';
    const params = [];
    let paramCount = 0;

    if (userRole === 'vendor') {
      vendorJoin = 'JOIN order_items oi ON o.id = oi.order_id JOIN products prod ON oi.product_id = prod.id';
      paramCount++;
      vendorWhere = ` AND prod.vendor_id = $${paramCount} `;
      params.push(userId);
    }

    let query = `
      SELECT
        o.*,
        u.name as user_name,
        u.email as user_email,
        p.payment_method,
        p.payment_status,
        p.shipping_status,
        p.tracking_number
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      ${vendorJoin}
      WHERE 1=1
      ${vendorWhere}
    `;
    let countQuery = `
      SELECT COUNT(DISTINCT o.id)
      FROM orders o
      ${vendorJoin}
      WHERE 1=1
      ${vendorWhere}
    `;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      countQuery += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    // تمرير البارامترات مرة أخرى لـ countQuery إذا كان vendor
    const countParams = userRole === 'vendor' ? [userId] : [];
    if (status) countParams.push(status);


    const ordersResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      orders: ordersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تحديث حالة الطلب (لا تغيير)
const updateOrderStatus = async (req, res) => {
  // ... المنطق كما هو (للمشرف/البائع)
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // المشرف يغير حالة أي طلب
      // البائع يمكنه تغيير حالة الطلب إذا كان يحتوي على منتجاته فقط

      let baseQuery = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
      const params = [status, id];

      if (userRole === 'vendor') {
         // التحقق مما إذا كان الطلب يحتوي على منتجات تابعة لهذا البائع
         const checkVendorOrder = await client.query(`
            SELECT COUNT(oi.product_id)
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1 AND p.vendor_id = $2
         `, [id, userId]);

         if (parseInt(checkVendorOrder.rows[0].count) === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, error: 'Access denied. Order does not contain your products.' });
         }
         // إذا كان الطلب يحتوي على منتجاته، يسمح بالتحديث (على الرغم من أن التحديث يؤثر على الطلب بالكامل)
      }

      // تحديث حالة الطلب
      const orderResult = await client.query(baseQuery, params);

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // إذا كان هناك رقم تتبع، تحديث سجل الشحن
      if (tracking_number) {
        await client.query(
          'UPDATE payments SET tracking_number = $1, shipping_status = $2 WHERE order_id = $3',
          [tracking_number, status === 'shipped' ? 'shipped' : 'pending', id]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order: orderResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// إدارة المنتجات (للمشرفين - لا تغيير)
const getAllProductsAdmin = async (req, res) => {
  // ... المنطق كما هو
  try {
    const { page = 1, limit = 10, category_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        p.*,
        c.name as category_name,
        u.name as vendor_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.vendor_id = u.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) FROM products WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    if (category_id) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      countQuery += ` AND category_id = $${paramCount}`;
      params.push(category_id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const productsResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, category_id ? [category_id] : []);

    res.json({
      success: true,
      products: productsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get all products admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAllOrders,
  updateOrderStatus,
  getAllProductsAdmin
};