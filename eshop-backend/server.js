const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');

// 1. تحميل متغيرات البيئة
dotenv.config();

// 2. تهيئة التطبيق
const app = express();

// 3. أدوات الحماية والـ Middleware الأساسية
// معالجة JSON (مع تحديد الحجم للحماية من هجمات الإغراق)
app.use(express.json({ limit: '10kb' }));

// تسجيل الطلبات (Logging) في وضع التطوير
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// إعدادات الأمان (Security Headers)
app.use(helmet());

// الحماية من هجمات XSS
app.use(xss());

// الحماية من تلوث المعاملات (Parameter Pollution)
app.use(hpp());

// تحديد معدل الطلبات (Rate Limiting) - 100 طلب كل 10 دقائق
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// إعدادات CORS (للربط مع الفرونت إند)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 4. جعل مجلد الصور عاماً (للوصول لصور المنتجات)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. تعريف المسارات (Routes)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vendor', require('./routes/vendor')); // جديد: مسارات لوحة البائع

// المسار الرئيسي للفحص
app.get('/', (req, res) => {
  res.send('🚀 E-Shop API is running...');
});

// 6. معالجة الأخطاء (يجب أن يكون في النهاية)
app.use(errorHandler);

// 7. تشغيل السيرفر
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// التعامل مع الأخطاء غير المتوقعة (Unhandled Rejections)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // إغلاق السيرفر بأمان
  server.close(() => process.exit(1));
});