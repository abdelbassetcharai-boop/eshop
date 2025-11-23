const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// تطبيق الحماية على جميع المسارات (يجب أن يكون المستخدم مسجلاً)
router.use(protect);

// المسار: /api/addresses
router.route('/')
  .get(getAddresses) // عرض كل العناوين
  .post(addAddress); // إضافة عنوان جديد

// المسار: /api/addresses/:id
router.route('/:id')
  .put(updateAddress)    // تعديل عنوان موجود
  .delete(deleteAddress); // حذف عنوان

module.exports = router;