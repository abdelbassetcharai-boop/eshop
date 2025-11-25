const { pool } = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get active shipping methods
// @route   GET /api/shipping/methods
// @access  Public
exports.getShippingMethods = asyncHandler(async (req, res, next) => {

  try {
    // محاولة جلب البيانات من قاعدة البيانات
    const result = await pool.query('SELECT * FROM shipping_methods WHERE is_active = true ORDER BY price ASC');

    // إذا وجدنا بيانات في قاعدة البيانات، نعيدها
    if (result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    }
  } catch (error) {
    // في حال عدم وجود الجدول أو حدوث خطأ، سنتجاهل الخطأ ونعيد البيانات الافتراضية أدناه
    console.warn("Shipping table not found or empty, using fallback data.");
  }

  // --- البيانات الاحتياطية (Fallback Data) ---
  // يتم استخدامها إذا كان الجدول فارغاً أو غير موجود لمنع تعطل الواجهة الأمامية
  const defaultMethods = [
    {
      id: 1,
      name: 'شحن قياسي (Standard)',
      price: 10.00,
      estimated_days: '5-7 أيام عمل',
      description: 'توصيل اقتصادي لجميع المناطق'
    },
    {
      id: 2,
      name: 'شحن سريع (Express)',
      price: 25.00,
      estimated_days: '2-3 أيام عمل',
      description: 'الأسرع للطلبات المستعجلة'
    },
    {
      id: 3,
      name: 'شحن مجاني',
      price: 0.00,
      estimated_days: '7-10 أيام عمل',
      description: 'للطلبات فوق 100$'
    }
  ];

  res.status(200).json({
    success: true,
    count: defaultMethods.length,
    data: defaultMethods,
    isFallback: true // علامة للمطور ليعرف أن هذه بيانات وهمية
  });
});