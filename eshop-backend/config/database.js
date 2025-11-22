const { Pool } = require('pg');

// ********** هام: يجب تغيير كلمة المرور Host والحقول الأخرى لتناسب إعداداتك **********
// (تم استخدام قيم ثابتة هنا لتجنب الاعتماد على ملف .env الذي قد يكون غير محمل)

const pool = new Pool({
  // يمكنك استبدال هذه القيم مباشرة بالقيم التي تعمل لديك في PostgreSQL
  user: 'postgres',
  host: 'localhost', // إذا فشل الاتصال، جرب '127.0.0.1'
  database: 'eshop',
  password: 'MyNewPassword123', // <--- تأكد من تغيير هذا إلى كلمة المرور الحقيقية
  port: 5432,
});

// اختبار الاتصال (هذا السطر يوضح ما إذا كانت قاعدة البيانات تعمل أم لا)
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error: PLEASE CHECK DB_PASSWORD AND PORT', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

module.exports = pool;