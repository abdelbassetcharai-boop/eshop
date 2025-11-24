const Joi = require('joi');

// 1. مخطط تسجيل مستخدم جديد (عميل عادي أو أدمن)
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
  role: Joi.string().valid('customer', 'admin').optional()
});

// 2. مخطط تسجيل بائع جديد (جديد)
exports.vendorRegisterSchema = Joi.object({
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
  store_name: Joi.string().min(3).max(50).required()
    .messages({
      'string.min': 'اسم المتجر يجب أن يكون 3 أحرف على الأقل',
      'any.required': 'اسم المتجر حقل مطلوب'
    })
});

// 3. مخطط تسجيل الدخول
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// 4. مخطط إدارة المنتجات (مشترك للأدمن والبائع)
exports.productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).default(0),
  category_id: Joi.number().integer().required(),
  image_url: Joi.string().uri().optional().allow('')
});

// 5. مخطط إدارة التصنيفات
exports.categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  image_url: Joi.string().uri().optional().allow('')
});

// 6. مخطط طلب سحب الأرباح (جديد)
exports.payoutRequestSchema = Joi.object({
  amount: Joi.number().positive().min(50).required()
    .messages({
      'number.min': 'الحد الأدنى للسحب هو 50',
      'any.required': 'المبلغ مطلوب'
    }),
  notes: Joi.string().allow('').optional()
});