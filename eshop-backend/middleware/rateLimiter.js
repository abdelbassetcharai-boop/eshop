const rateLimit = require('express-rate-limit');

// تحديد المعدل لهجمات القوة الغاشمة (Brute-Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // السماح بـ 100 طلب في 15 دقيقة
  message: {
    success: false,
    error: 'تم تجاوز الحد المسموح به للطلبات. يرجى المحاولة لاحقاً.',
  },
  standardHeaders: true, // عرض معلومات الحد في الرؤوس
  legacyHeaders: false,
});

// تحديد معدل صارم لعمليات تسجيل الدخول والتسجيل
const strictAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 5, // 5 محاولات فقط في 5 دقائق لكل IP
  message: {
    success: false,
    error: 'محاولات تسجيل الدخول كثيرة جداً. يرجى الانتظار 5 دقائق والمحاولة مرة أخرى.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, strictAuthLimiter };