const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { pool } = require('../config/database');

// حماية المسارات (يجب أن يكون المستخدم مسجلاً للدخول)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. فحص وجود التوكن في الـ Header (الترويسة)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // استخراج التوكن من الصيغة: Bearer <token>
    token = req.headers.authorization.split(' ')[1];
  }

  // يمكن إضافة دعم للكوكيز هنا مستقبلاً إذا أردت
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // 2. التأكد من وجود التوكن فعلياً
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // 3. فك تشفير التوكن والتحقق من صحته
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. جلب بيانات المستخدم من قاعدة البيانات بناءً على الـ ID في التوكن
    // نختار الحقول الأساسية فقط للأمان
    const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
    const result = await pool.query(query, [decoded.id]);

    // 5. التأكد من أن المستخدم لا يزال موجوداً (لم يتم حذفه)
    if (result.rows.length === 0) {
      return next(new ErrorResponse('The user belonging to this token no longer exists.', 401));
    }

    // 6. تخزين بيانات المستخدم في الطلب (req) لاستخدامها في المراحل التالية
    req.user = result.rows[0];
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// تحديد الصلاحيات (مثلاً للأدمن فقط)
// طريقة الاستخدام: authorize('admin', 'manager')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403 // Forbidden (ممنوع)
        )
      );
    }
    next();
  };
};