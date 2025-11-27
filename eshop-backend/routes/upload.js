const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// المسار: POST /api/upload
router.post('/', protect, authorize('admin', 'vendor'), (req, res, next) => {
  // استخدام دالة upload داخل الـ route للتحكم في الأخطاء
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      // إذا كان الخطأ من Multer أو Cloudinary
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // النجاح: إرجاع الرابط
    res.status(200).json({
      success: true,
      data: req.file.path // رابط Cloudinary المباشر
    });
  });
});

module.exports = router;