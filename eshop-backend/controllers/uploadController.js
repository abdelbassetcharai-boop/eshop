const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// 1. إعداد محرك التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. فلتر للتحقق من نوع الملف (صور + فيديو)
const fileFilter = (req, file, cb) => {
  // السماح بالصور والفيديوهات
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Only Images (jpeg, jpg, png, webp) and Videos (mp4, webm) are allowed!', 400), false);
  }
};

// 3. إعداد Multer النهائي
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // زيادة الحد لـ 50 ميجابايت لاستيعاب الفيديوهات القصيرة
  },
  fileFilter: fileFilter
});

module.exports = upload;