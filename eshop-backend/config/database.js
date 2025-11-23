const { Pool } = require('pg');

// التأكد من تحميل متغيرات البيئة في حال تم استدعاء هذا الملف بشكل منفصل
if (!process.env.DB_HOST) {
  require('dotenv').config();
}

// إعداد مجمع الاتصالات (Connection Pool)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  // تحسينات الأداء (Performance Tuning)
  max: 20, // أقصى عدد للاتصالات المتزامنة
  idleTimeoutMillis: 30000, // إغلاق الاتصال الخامل بعد 30 ثانية
  connectionTimeoutMillis: 2000, // مهلة محاولة الاتصال
});

// مراقبة أحداث الاتصال (لأغراض التصحيح - Debugging)
pool.on('connect', () => {
  // يتم تفعيل هذا الحدث في كل مرة يتم فيها إنشاء "عميل" جديد في المجمع
  // console.log('📦 New client connected to database');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1); // إيقاف التطبيق في حال حدوث خطأ جسيم في الاتصال
});

// دالة مساعدة لتنفيذ الاستعلامات
// هذا النمط يسمح لنا بإضافة Logging أو منطق إضافي مستقبلاً لكل استعلام
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // تصدير الـ pool نفسه لاستخدامه في المعاملات (Transactions)
};