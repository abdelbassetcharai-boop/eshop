const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// استيراد أدوات الحماية والتحقق
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware');
const { categorySchema } = require('../validation/schemas');

const router = express.Router();

// --- المسارات العامة (Public Routes) ---
// يمكن لأي شخص عرض التصنيفات
router.get('/', getCategories);
router.get('/:id', getCategory);

// --- مسارات الأدمن (Admin Routes) ---
// تتطلب تسجيل دخول (protect) وصلاحية أدمن (authorize)
// وتتحقق من صحة البيانات (validate) قبل الإنشاء أو التعديل

router.post(
  '/',
  protect,
  authorize('admin'),
  validate(categorySchema),
  createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(categorySchema),
  updateCategory
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteCategory
);

module.exports = router;