const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// 1. المسارات العامة (Public Routes - Headless CMS)
// هذه المسارات تسمح للواجهة بجلب الإعدادات دون تسجيل دخول
// ============================================================
app.use('/api/public', require('./routes/public'));

// ============================================================
// 2. مسارات المتجر الأساسية (Store Routes)
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/addresses', require('./routes/addresses'));

// ============================================================
// 3. مسارات لوحة التحكم (Admin Routes)
// تم تحديث هذا الملف ليشمل التحكم الكامل في النظام
// ============================================================
app.use('/api/admin', require('./routes/admin'));

// ============================================================
// 4. فحص حالة النظام (Health Check)
// ============================================================
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/database');
    await db.query('SELECT 1');
    res.json({
      status: '✅ System Operational',
      mode: 'Dynamic / Global',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// نقطة النهاية الرئيسية
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Global Dynamic E-commerce API Running',
    bootstrap_url: '/api/public/bootstrap'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Dynamic API: http://localhost:${PORT}/api/public/bootstrap`);
});

// --- كود مؤقت لإنشاء أدمن ---
// احذفه بعد أن يعمل الدخول
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const createAdmin = async () => {
  const email = 'admin@store.com';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // محاولة تحديث المستخدم إذا كان موجوداً
    const res = await pool.query(
      "UPDATE users SET password = $1, role = 'admin' WHERE email = $2 RETURNING *",
      [hashedPassword, email]
    );

    if (res.rows.length === 0) {
      // إذا لم يكن موجوداً، ننشئه
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')",
        ['Admin User', email, hashedPassword]
      );
      console.log('✅ Admin created: admin@store.com / 123456');
    } else {
      console.log('✅ Admin updated: admin@store.com / 123456');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
};

// شغل الدالة مرة واحدة عند بدء السيرفر
createAdmin();
// ---------------------------