const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/auth');

// المسار: POST /api/upload
// الوصف: رفع صورة منتج (مسموح للأدمن فقط)
router.post('/', protect, authorize('admin'), upload.single('image'), (req, res) => {
  // التأكد من وجود ملف في الطلب
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  // إرجاع مسار الصورة (مع استبدال الشرطة المائلة العكسية في ويندوز)
  // هذا المسار سيتم تخزينه في قاعدة البيانات في حقل image_url
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: `/${req.file.path.replace(/\\/g, '/')}`
  });
});

module.exports = router;