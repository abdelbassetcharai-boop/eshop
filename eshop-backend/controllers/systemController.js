const pool = require('../config/database');

// ============================================================
// دالة التشغيل الأولي (Bootstrap API)
// ============================================================
const getSystemConfig = async (req, res) => {
  try {
    // تحديد اللغة المطلوبة (الافتراضي العربية)
    const lang = req.query.lang || 'ar';

    // استخدام Promise.all لتنفيذ جميع الاستعلامات في وقت واحد
    const [
      configsResult,
      themeResult,
      translationsResult,
      layoutResult,
      zonesResult,
      bannersResult,
      flashSalesResult
    ] = await Promise.all([
      // 1. جلب إعدادات النظام العامة (الاسم، اللوجو، العملة)
      pool.query('SELECT key, value, type FROM system_configs'),

      // 2. جلب إعدادات الثيم (الألوان والخطوط)
      pool.query('SELECT variable_name, value FROM theme_settings'),

      // 3. جلب الترجمات والنصوص حسب اللغة المطلوبة
      pool.query('SELECT key, value FROM ui_translations WHERE lang_code = $1', [lang]),

      // 4. جلب تخطيط الصفحة الرئيسية (ترتيب المكونات)
      // نستخدم COALESCE لضمان أننا نحصل على مصفوفة فارغة إذا لم يوجد تخطيط
      pool.query("SELECT components FROM page_layouts WHERE page_slug = 'home'"),

      // 5. جلب مناطق الشحن النشطة
      pool.query('SELECT id, name, base_cost, country_code FROM shipping_zones WHERE is_active = true'),

      // 6. جلب البنرات النشطة للسلايدر الرئيسي
      pool.query("SELECT * FROM banners WHERE position = 'main_slider' AND is_active = true ORDER BY sort_order ASC"),

      // 7. جلب العروض المؤقتة السارية
      pool.query("SELECT * FROM flash_sales WHERE is_active = true AND end_time > NOW()")
    ]);

    // --- معالجة البيانات لتسهيل قراءتها في الفرونت إند ---

    // تحويل الإعدادات من مصفوفة إلى كائن (Object)
    const config = configsResult.rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // تحويل الثيم إلى كائن
    const theme = themeResult.rows.reduce((acc, curr) => {
      acc[curr.variable_name] = curr.value;
      return acc;
    }, {});

    // تحويل الترجمات إلى كائن
    const translations = translationsResult.rows.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // جلب مكونات التخطيط بأمان (إذا كانت موجودة في الصف الأول)
    const layoutComponents = layoutResult.rows[0]?.components || [];

    // إرسال الرد النهائي
    res.json({
      success: true,
      data: {
        config,              // إعدادات عامة
        theme,               // ألوان وخطوط
        translations,        // نصوص
        layout: layoutComponents, // ترتيب الصفحة الرئيسية
        shipping_zones: zonesResult.rows, // المدن المدعومة
        banners: bannersResult.rows,      // صور السلايدر
        flash_sales: flashSalesResult.rows // العروض المؤقتة
      }
    });

  } catch (error) {
    console.error('❌ Bootstrap Critical Error:', error);
    // إرجاع خطأ 500 ليتمكن الـ Frontend من التقاطه
    res.status(500).json({ success: false, error: 'System Configuration Load Failure' });
  }
};

module.exports = {
  getSystemConfig
};