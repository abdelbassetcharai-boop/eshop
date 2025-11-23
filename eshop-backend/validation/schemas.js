const Joi = require('joi');

// 1. مخطط تسجيل مستخدم جديد
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
      'any.required': 'الاسم حقل مطلوب'
    }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون 6 خانات على الأقل'
    }),
  // السماح بتحديد الدور (اختياري) مع حصر القيم المسموحة
  role: Joi.string().valid('customer', 'admin').optional()
});

// 2. مخطط تسجيل الدخول
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// 3. مخطط إدارة المنتجات (للأدمن)
exports.productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).default(0),
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().uri().optional().allow('')
});

// 4. مخطط إدارة التصنيفات
exports.categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().uri().optional().allow('')
});