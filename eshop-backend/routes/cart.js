const express = require('express');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// استيراد وسيط الحماية (ضروري لأن السلة مرتبطة بالمستخدم)
const { protect } = require('../middleware/auth');

const router = express.Router();

// تطبيق الحماية على كل المسارات في هذا الملف
router.use(protect);

// المسار: /api/cart
router.route('/')
  .get(getCart)       // عرض محتويات السلة
  .post(addToCart)    // إضافة منتج للسلة
  .delete(clearCart); // إفراغ السلة بالكامل

// المسار: /api/cart/:id
// ملاحظة: id هنا هو معرف السجل في السلة (item id) وليس معرف المنتج
router.route('/:id')
  .delete(removeFromCart); // حذف عنصر محدد

module.exports = router;