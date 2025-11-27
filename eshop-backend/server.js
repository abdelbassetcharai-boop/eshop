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
// معالجة JSON
app.use(express.json({ limit: '10kb' }));

// تسجيل الطلبات (Logging)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// إعدادات CORS (مهم جداً لحل المشكلة)
// نسمح بجميع الطلبات من الـ Frontend، ونسمح بإرسال الكوكيز والترويسات
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // للسماح بالكوكيز والتوكن
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Language']
}));

// إعدادات Helmet (الأمان)
// نعدل السياسة للسماح بتحميل الصور والموارد من أصول مختلفة
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// الحماية من هجمات XSS و Pollution
app.use(xss());
app.use(hpp());

// تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500, // زيادة الحد قليلاً للتطوير
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// 4. الملفات الاستاتيكية (الصور)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. تعريف المسارات
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/addresses', require('./routes/addresses')); // تأكد أن هذا المسار موجود ويعمل
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/public', require('./routes/public'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/vendor', require('./routes/vendor'));

// فحص الصحة
app.get('/', (req, res) => {
  res.send('🚀 E-Shop API is running...');
});

// 6. معالجة الأخطاء
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});