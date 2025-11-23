const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Upload single file (image)
// @route   POST /api/upload
// @access  Private (Admin)
exports.uploadFile = asyncHandler(async (req, res, next) => {
  // 1. التأكد من أن الوسيط (Multer) قد مرر ملفاً
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // 2. تنسيق مسار الملف (استبدال الشرطة المائلة العكسية في ويندوز)
  // هذا المسار هو ما سيتم تخزينه في قاعدة البيانات (مثل: /uploads/image-123.jpg)
  const filePath = `/${req.file.path.replace(/\\/g, '/')}`;

  // 3. إرجاع الرد
  res.status(200).json({
    success: true,
    data: filePath,
    message: 'File uploaded successfully'
  });
});