const pool = require('../config/database');

// إضافة تقييم لمنتج
const addReview = async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user.id;
  const { rating, comment } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. التحقق: هل اشترى المستخدم هذا المنتج ولديه طلب مكتمل؟
    const hasPurchased = await client.query(`
      SELECT o.id
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      AND oi.product_id = $2
      AND o.status = 'completed'
      LIMIT 1
    `, [user_id, product_id]);

    if (hasPurchased.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        error: 'You can only review products you have purchased and completed.'
      });
    }

    // 2. التحقق: هل سبق أن ترك المستخدم تقييماً لهذا المنتج؟ (UNIQUE constraint)
    const existingReview = await client.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );

    if (existingReview.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this product.'
      });
    }

    // 3. إضافة التقييم
    const result = await client.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [product_id, user_id, rating, comment]
    );

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  } finally {
    client.release();
  }
};

module.exports = {
  addReview
};