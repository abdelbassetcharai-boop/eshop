const Joi = require('joi');

// **********************************************
// 1. مخططات المصادقة (Auth Schemas)
// **********************************************

const authSchemas = {
  // مخطط تسجيل الدخول
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'البريد الإلكتروني المدخل غير صحيح.',
      'any.required': 'حقل البريد الإلكتروني مطلوب.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'كلمة المرور يجب أن لا تقل عن 6 أحرف.',
      'any.required': 'حقل كلمة المرور مطلوب.',
    }),
  }),

  // مخطط التسجيل
  register: Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.min': 'الاسم يجب أن لا يقل عن 3 أحرف.',
      'any.required': 'حقل الاسم مطلوب.',
    }),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required().messages({
      'string.min': 'كلمة المرور يجب أن لا تقل عن 8 أحرف لزيادة الأمان.',
    }),
    role: Joi.string().valid('customer', 'vendor').default('customer'),
  }),
};

// **********************************************
// 2. مخططات المنتجات والتقييمات (Product & Review Schemas)
// **********************************************

const productSchemas = {
  // مخطط إنشاء وتحديث المنتج
  product: Joi.object({
    name: Joi.string().min(5).max(255).optional(),
    description: Joi.string().min(10).optional().allow(''),
    price: Joi.number().precision(2).positive().optional().messages({
      'number.positive': 'يجب أن يكون سعر المنتج رقماً موجباً.',
      'number.base': 'السعر يجب أن يكون رقماً.',
    }),
    stock: Joi.number().integer().min(0).optional().default(0).messages({
      'number.min': 'كمية المخزون يجب أن تكون صفراً أو أكثر.',
      'number.integer': 'المخزون يجب أن يكون رقماً صحيحاً.',
    }),
    category_id: Joi.number().integer().positive().optional(),
    image_url: Joi.string().uri().optional().allow(''),
    is_active: Joi.boolean().optional(),
  }).min(1),

  // مخطط إضافة تقييم
  createReview: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'التقييم يجب أن يكون 1 على الأقل.',
      'number.max': 'التقييم يجب أن يكون 5 كحد أقصى.',
    }),
    comment: Joi.string().max(500).optional().allow(''),
  }),
};


// **********************************************
// 3. مخططات العربة والطلب (Cart & Order Schemas)
// **********************************************

const cartSchemas = {
  // مخطط إضافة منتج للعربة
  addToCart: Joi.object({
    product_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().min(1).required().messages({
      'number.min': 'الكمية يجب أن تكون 1 على الأقل.',
    }),
  }),

  // مخطط تحديث كمية المنتج في العربة
  updateCart: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),
};

const orderSchemas = {
  // مخطط إنشاء طلب
  createOrder: Joi.object({
    shipping_address: Joi.string().min(10).required(),
    payment_method: Joi.string().max(50).required(),
    shipping_cost: Joi.number().precision(2).min(0).optional().default(0),
  }),
};

// **********************************************
// 4. مخططات الإدارة العامة (Admin Schemas)
// **********************************************

const adminSchemas = {
  // مخطط تحديث الإعدادات العامة
  config: Joi.object({
    site_name: Joi.string().optional(),
    site_logo: Joi.string().uri().optional(),
    maintenance_mode: Joi.string().valid('true', 'false').optional(),
    default_currency: Joi.string().length(3).optional(),
    contact_email: Joi.string().email().optional(),
    // يقبل أي مفتاح/قيمة لتحديث الإعدادات العامة
  }).pattern(Joi.string(), Joi.any()).min(1),

  // مخطط تحديث الثيم
  theme: Joi.object({
    '--primary-color': Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    '--font-family': Joi.string().optional(),
    '--secondary-color': Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    '--border-radius': Joi.string().optional(),
  }).pattern(Joi.string().regex(/^--/), Joi.string()).min(1),

  // مخطط الفئات
  category: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().optional().allow(''),
  }).min(1),

  // مخطط مناطق الشحن
  shippingZone: Joi.object({
    name: Joi.string().max(100).required(),
    country_code: Joi.string().length(2).optional().default('SA'),
    base_cost: Joi.number().precision(2).min(0).required(),
    delivery_days_min: Joi.number().integer().min(1).optional().default(2),
    delivery_days_max: Joi.number().integer().min(1).optional().default(5),
    is_active: Joi.boolean().optional(),
  }).min(1),

  // مخطط البنرات
  banner: Joi.object({
    title: Joi.string().max(200).optional().allow(''),
    image_url: Joi.string().uri().required(),
    link_url: Joi.string().uri().optional().allow(''),
    position: Joi.string().max(50).optional().default('main_slider'),
    sort_order: Joi.number().integer().min(0).optional().default(0),
    is_active: Joi.boolean().optional(),
  }).min(1),

  // مخطط الترجمة
  translation: Joi.object({
    key: Joi.string().max(100).required(),
    lang_code: Joi.string().length(2).required(),
    value: Joi.string().required(),
  }).min(1),

  // مخطط العروض المؤقتة
  flashSale: Joi.object({
    title: Joi.string().max(200).required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().required().min(Joi.ref('start_time')),
    discount_percentage: Joi.number().integer().min(1).max(100).required(),
    banner_image: Joi.string().uri().optional().allow(''),
    is_active: Joi.boolean().optional(),
  }).min(1),
};

module.exports = {
  authSchemas,
  productSchemas,
  cartSchemas,
  orderSchemas,
  adminSchemas
};