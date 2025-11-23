const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// استيراد دوال التقييمات لربطها كمسار فرعي
const { getReviews, createReview } = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware');
const { productSchema } = require('../validation/schemas');

const router = express.Router();

// --- المسارات العامة (Public) ---
// عرض جميع المنتجات أو منتج واحد
router.get('/', getProducts);
router.get('/:id', getProduct);

// --- مسارات التقييمات (Reviews) ---
// عرض تقييمات منتج معين
router.get('/:productId/reviews', getReviews);
// إضافة تقييم (يتطلب تسجيل دخول)
router.post('/:productId/reviews', protect, createReview);

// --- مسارات الأدمن (Admin) ---
// تتطلب حماية وصلاحية 'admin' وتحقق من صحة البيانات

router.post(
  '/',
  protect,
  authorize('admin'),
  validate(productSchema),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validate(productSchema),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

module.exports = router;