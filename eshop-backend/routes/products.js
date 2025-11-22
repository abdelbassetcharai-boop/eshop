const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const { vendorAuth } = require('../middleware/adminAuth');
const validate = require('../middleware/validationMiddleware'); // استيراد التحقق
const { productSchemas } = require('../validation/schemas');       // استيراد المخططات

// routes عامة (لا تحتاج مصادقة)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// routes محمية (للبائعين والمشرفين فقط)
// تطبيق التحقق على الإنشاء
router.post('/', auth, vendorAuth, validate(productSchemas.product), createProduct);
// تطبيق التحقق على التحديث (باستخدام نفس المخطط، لكن Joi يسمح بالحد الأدنى من الحقول)
router.put('/:id', auth, vendorAuth, validate(productSchemas.product), updateProduct);
router.delete('/:id', auth, vendorAuth, deleteProduct);

module.exports = router;