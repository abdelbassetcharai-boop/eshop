const pool = require('../config/database');

// إضافة منتج للعربة
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and quantity are required'
      });
    }

    // التحقق من وجود المنتج
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // التحقق من الكمية المتاحة
    const product = productResult.rows[0];
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Not enough stock available'
      });
    }

    // التحقق إذا المنتج موجود مسبقاً في العربة
    const existingCartItem = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );

    let result;
    if (existingCartItem.rows.length > 0) {
      // تحديث الكمية إذا المنتج موجود
      result = await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, user_id, product_id]
      );
    } else {
      // إضافة جديدة إذا المنتج غير موجود
      result = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user_id, product_id, quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// عرض عربة المستخدم
const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(`
      SELECT
        c.id as cart_id,
        c.quantity,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock,
        (p.price * c.quantity) as total_price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [user_id]);

    // حساب الإجمالي
    const total = result.rows.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

    res.json({
      success: true,
      cart: result.rows,
      total: total.toFixed(2),
      itemCount: result.rows.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تحديث كمية المنتج في العربة
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    const result = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// حذف منتج من العربة
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تفريغ العربة
const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    await pool.query(
      'DELETE FROM cart WHERE user_id = $1',
      [user_id]
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};