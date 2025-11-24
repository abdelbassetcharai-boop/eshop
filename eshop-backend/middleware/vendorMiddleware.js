const { pool } = require('../config/database');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// التحقق من أن المستخدم لديه صلاحية "بائع"
// هذه الدالة تُستخدم بعد دالة protect الأساسية
exports.protectVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    return next(new ErrorResponse('Not authorized as a vendor', 403));
  }
};

// التحقق من أن حساب البائع معتمد من قبل الإدارة
// يجب استدعاء هذه الدالة بعد protect و protectVendor
exports.checkVendorApproval = asyncHandler(async (req, res, next) => {
  // نفترض أن المستخدم الحالي (req.user) تم تعيينه بواسطة middleware المصادقة
  const query = 'SELECT is_approved FROM vendors WHERE user_id = $1';
  const result = await pool.query(query, [req.user.id]);

  if (result.rows.length === 0) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  const vendor = result.rows[0];

  if (!vendor.is_approved) {
    return next(new ErrorResponse('Your vendor account is pending approval', 403));
  }

  next();
});