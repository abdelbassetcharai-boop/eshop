// هذه الدالة تستقبل دالة أخرى (fn) كمدخل
// وتقوم بتغليفها بـ Promise للتعامل مع الأخطاء بشكل تلقائي
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;