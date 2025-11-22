// ملف middleware/validationMiddleware.js

/**
 * Middleware لتطبيق مخطط Joi على req.body
 * @param {Joi.ObjectSchema} schema - مخطط Joi للتحقق
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

  if (error) {
    // تنسيق رسائل الخطأ لتكون سهلة القراءة في الواجهة
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]+/g, ''),
    }));

    return res.status(400).json({
      success: false,
      error: 'خطأ في التحقق من البيانات المدخلة (Validation Error)',
      details,
      raw_message: error.details[0].message // لعرض أول خطأ بشكل مباشر
    });
  }

  next();
};

module.exports = validate;