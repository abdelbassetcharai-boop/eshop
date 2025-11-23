const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get active banners for homepage
// @route   GET /api/public/banners
// @access  Public
exports.getBanners = asyncHandler(async (req, res, next) => {
  // جلب البنرات النشطة فقط وترتيبها حسب الأولوية (sort_order)
  const query = `
    SELECT * FROM banners
    WHERE is_active = true
    ORDER BY sort_order ASC
  `;

  const result = await pool.query(query);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows
  });
});

// @desc    Get public bootstrap configuration
// @route   GET /api/public/bootstrap
// @access  Public
exports.getBootstrap = asyncHandler(async (req, res, next) => {
  // إرجاع إعدادات عامة للفرونت إند (مثل العملة، اسم الموقع، حالة الصيانة)
  // يمكن لاحقاً جلب هذه البيانات من جدول 'settings' إذا تم إنشاؤه
  const config = {
    appName: 'EShop',
    currency: {
      code: 'USD',
      symbol: '$'
    },
    supportEmail: 'support@eshop.com',
    maintenanceMode: false
  };

  res.status(200).json({
    success: true,
    data: config
  });
});