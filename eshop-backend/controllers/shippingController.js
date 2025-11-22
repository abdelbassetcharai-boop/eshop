const pool = require('../config/database');

// الحصول على مناطق الشحن (بدلاً من شركات الشحن)
const getShippingZones = async (req, res) => {
  try {
    // تم تغيير shipping_companies إلى shipping_zones
    const result = await pool.query(`
      SELECT id, name, base_cost, delivery_days_min, delivery_days_max
      FROM shipping_zones
      WHERE is_active = TRUE
      ORDER BY base_cost ASC
    `);

    res.json({
      success: true,
      zones: result.rows
    });
  } catch (error) {
    console.error('Get shipping zones error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// حساب تكلفة الشحن
const calculateShipping = async (req, res) => {
  try {
    // نعتمد الآن على shipping_zone_id بدلاً من company_id
    const { shipping_zone_id, total_weight, total_price } = req.body;

    const zoneResult = await pool.query(
      'SELECT * FROM shipping_zones WHERE id = $1',
      [shipping_zone_id]
    );

    if (zoneResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shipping zone not found'
      });
    }

    const zone = zoneResult.rows[0];

    let shipping_cost = parseFloat(zone.base_cost);

    // مثال منطق حساب الشحن (يمكن تطويره لاحقاً)
    // إضافة رسوم إضافية للطلبات الكبيرة
    if (total_price && total_price >= 500) {
      shipping_cost *= 1.1; // زيادة 10%
    }
    // يمكن هنا إضافة منطق بناء على الوزن (total_weight)

    const delivery_days_min = zone.delivery_days_min;
    const delivery_days_max = zone.delivery_days_max;

    res.json({
      success: true,
      shipping: {
        zone: zone.name,
        cost: shipping_cost.toFixed(2),
        delivery_days_min: delivery_days_min,
        delivery_days_max: delivery_days_max
      }
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getShippingZones,
  calculateShipping
};