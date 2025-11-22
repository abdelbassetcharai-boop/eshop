const pool = require('../config/database');

// إضافة عنوان جديد
const addAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { title, address, city, phone } = req.body;

    const result = await pool.query(
      `INSERT INTO user_addresses
       (user_id, title, address, city, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title, address, city, phone]
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: result.rows[0]
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// الحصول على عناوين المستخدم
const getUserAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT * FROM user_addresses
       WHERE user_id = $1
       ORDER BY id DESC`,
      [user_id]
    );

    res.json({
      success: true,
      addresses: result.rows
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// تحديث العنوان
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { title, address, city, phone } = req.body;

    const result = await pool.query(
      `UPDATE user_addresses
       SET title = $1, address = $2, city = $3, phone = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, address, city, phone, id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: result.rows[0]
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// حذف العنوان
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      `DELETE FROM user_addresses
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
};