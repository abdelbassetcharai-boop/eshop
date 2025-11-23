const ErrorResponse = require('../utils/errorResponse');

// دالة وسيطة تستقبل "مخطط" (Schema) كمدخل
const validate = (schema) => (req, res, next) => {
  // التحقق من البيانات الموجودة في جسم الطلب (req.body)
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // تجميع كل رسائل الخطأ في نص واحد مفصول بفواصل
    const errorMessage = error.details.map((detail) => detail.message).join(', ');

    // إرجاع خطأ 400 (Bad Request)
    return next(new ErrorResponse(errorMessage, 400));
  }

  // إذا كانت البيانات سليمة، انتقل للخطوة التالية
  next();
};

module.exports = validate;