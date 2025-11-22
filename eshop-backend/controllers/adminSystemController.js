const pool = require('../config/database');

// ============================================================
// 1. تحديث إعدادات النظام العامة (اسم الموقع، اللوجو، العملة)
// ============================================================
const updateConfigs = async (req, res) => {
  const { configs } = req.body; // يتوقع مصفوفة: [{key: 'site_name', value: 'New Name'}, ...]

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const conf of configs) {
      await client.query(
        'UPDATE system_configs SET value = $1 WHERE key = $2',
        [conf.value, conf.key]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'تم تحديث الإعدادات بنجاح' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update Configs Error:', error);
    res.status(500).json({ error: 'فشل تحديث الإعدادات' });
  } finally {
    client.release();
  }
};

// ============================================================
// 2. تحديث ألوان الثيم والخطوط
// ============================================================
const updateTheme = async (req, res) => {
  const { theme } = req.body; // يتوقع مصفوفة: [{variable_name: '--primary-color', value: '#ff0000'}]

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of theme) {
      await client.query(
        'UPDATE theme_settings SET value = $1 WHERE variable_name = $2',
        [item.value, item.variable_name]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'تم تحديث الثيم بنجاح' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update Theme Error:', error);
    res.status(500).json({ error: 'فشل تحديث الثيم' });
  } finally {
    client.release();
  }
};

// ============================================================
// 3. تحديث تخطيط الصفحة (ترتيب المكونات)
// ============================================================
const updatePageLayout = async (req, res) => {
  const { page_slug, components } = req.body;

  try {
    // نستخدم UPSERT (تحديث إذا وجد، وإنشاء إذا لم يوجد)
    await pool.query(
      `INSERT INTO page_layouts (page_slug, components)
       VALUES ($1, $2)
       ON CONFLICT (page_slug)
       DO UPDATE SET components = $2, updated_at = NOW()`,
      [page_slug, JSON.stringify(components)]
    );

    res.json({ success: true, message: 'تم تحديث تخطيط الصفحة بنجاح' });
  } catch (error) {
    console.error('Update Layout Error:', error);
    res.status(500).json({ error: 'فشل تحديث التخطيط' });
  }
};

// ============================================================
// 4. إضافة منطقة شحن جديدة
// ============================================================
const addShippingZone = async (req, res) => {
  const { name, base_cost, country_code } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO shipping_zones (name, base_cost, country_code) VALUES ($1, $2, $3) RETURNING *',
      [name, base_cost, country_code]
    );

    res.json({ success: true, zone: result.rows[0], message: 'تم إضافة المنطقة بنجاح' });
  } catch (error) {
    console.error('Add Zone Error:', error);
    res.status(500).json({ error: 'فشل إضافة المنطقة' });
  }
};

module.exports = {
  updateConfigs,
  updateTheme,
  updatePageLayout,
  addShippingZone
};