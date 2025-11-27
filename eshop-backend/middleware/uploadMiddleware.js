const multer = require('multer');
const { storage } = require('../config/cloudinary'); // استيراد إعداد Cloudinary
const ErrorResponse = require('../utils/errorResponse');

// استخدام Cloudinary للتخزين بدلاً من القرص المحلي
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // الحد الأقصى 100 ميجابايت (للفيديوهات)
  },
  fileFilter: (req, file, cb) => {
    // التحقق من نوع الملف (صورة أو فيديو)
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new ErrorResponse('Invalid file type, only images and videos are allowed!', 400), false);
    }
  }
});

module.exports = upload;