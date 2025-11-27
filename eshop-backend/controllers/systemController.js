const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

exports.getBanners = asyncHandler(async (req, res, next) => {
  const query = `SELECT * FROM banners WHERE is_active = true ORDER BY sort_order ASC`;
  const result = await pool.query(query);
  res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
});

exports.getBootstrap = asyncHandler(async (req, res, next) => {
  const result = await pool.query('SELECT key, value FROM system_configs');
  const dbSettings = result.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
  }, {});

  const config = {
    currency: {
      code: 'MAD',
      symbol: dbSettings.currency_symbol || 'د.م.'
    },
    taxRate: parseFloat(dbSettings.tax_rate || 0.15),
    shippingFee: parseFloat(dbSettings.shipping_fee || 20),
    freeShippingThreshold: parseFloat(dbSettings.free_shipping_threshold || 500),
    paymentMethods: {
        cod: dbSettings.enable_cod !== 'false',
        stripe: dbSettings.enable_stripe === 'true'
    },
    siteName: dbSettings.site_name || 'EShop Morocco'
  };

  res.status(200).json({
    success: true,
    data: config
  });
});