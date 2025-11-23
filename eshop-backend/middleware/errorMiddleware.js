const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // طباعة الخطأ في الكونسول للمطورين
  console.log(err);

  // 1. معالجة أخطاء قاعدة البيانات (PostgreSQL)
  // الكود 23505: قيمة مكررة (Unique constraint violation) - مثل تكرار الإيميل
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // الكود 22P02: صيغة بيانات خاطئة (Invalid text representation) - مثل إرسال نص مكان رقم
  if (err.code === '22P02') {
    const message = 'Invalid input syntax';
    error = new ErrorResponse(message, 400);
  }

  // الكود 23503: خطأ المفتاح الأجنبي (Foreign key violation) - مثل طلب منتج غير موجود
  if (err.code === '23503') {
    const message = 'Resource not found or related record missing';
    error = new ErrorResponse(message, 404);
  }

  // 2. معالجة أخطاء التوكن (JWT)
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // 3. إرسال الرد النهائي
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    // إظهار تفاصيل الـ Stack Trace فقط في وضع التطوير للمساعدة في التتبع
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;