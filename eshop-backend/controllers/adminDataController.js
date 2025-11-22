const pool = require('../config/database');

// دالة مساعدة لإنشاء CRUD ديناميكي
const createCrudController = (tableName, primaryKey = 'id') => ({

  // -------------------------
  // 1. جلب الكل (GetAll)
  // -------------------------
  getAll: async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${primaryKey} DESC`);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      console.error(`Get all ${tableName} error:`, error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // -------------------------
  // 2. الإنشاء (Create)
  // -------------------------
  create: async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    try {
      const result = await pool.query(
        `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json({ success: true, message: `${tableName} created`, data: result.rows[0] });
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // -------------------------
  // 3. التحديث (Update)
  // -------------------------
  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    // بناء جملة SET: field1 = $1, field2 = $2, ...
    const setClauses = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    // إضافة ID للحقول
    values.push(id);

    try {
      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClauses} WHERE ${primaryKey} = $${fields.length + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }

      res.json({ success: true, message: `${tableName} updated`, data: result.rows[0] });
    } catch (error) {
      console.error(`Update ${tableName} error:`, error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  // -------------------------
  // 4. الحذف (Delete)
  // -------------------------
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = $1 RETURNING *`, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: `${tableName} not found` });
      }
      res.json({ success: true, message: `${tableName} deleted` });
    } catch (error) {
      console.error(`Delete ${tableName} error:`, error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },
});

// تعريف متحكمات CRUD لكل جدول
const categoryController = createCrudController('categories');
const shippingZoneController = createCrudController('shipping_zones');
const bannerController = createCrudController('banners');
const flashSaleController = createCrudController('flash_sales');
const uiTranslationController = createCrudController('ui_translations', 'key'); // نستخدم KEY كمعرف فريد للتحديث/الحذف

module.exports = {
  categoryController,
  shippingZoneController,
  bannerController,
  flashSaleController,
  uiTranslationController,
};