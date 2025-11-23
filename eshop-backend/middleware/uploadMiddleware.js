const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// 1. إعداد محرك التخزين (Storage Engine)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد المجلد الذي ستحفظ فيه الصور
    // ملاحظة: تأكد من وجود مجلد باسم 'uploads' في المجلد الرئيسي للمشروع
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // تسمية الملف: اسم الحقل + التاريخ + رقم عشوائي + الامتداد
    // مثال: image-1634567890-123.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. فلتر للتحقق من نوع الملف (File Filter)
const fileFilter = (req, file, cb) => {
  // الامتدادات المسموحة
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // التحقق من الامتداد
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // التحقق من نوع الـ MIME
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Images Only! (jpeg, jpg, png, gif, webp)', 400), false);
  }
};

// 3. إعداد Multer النهائي
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // الحد الأقصى 5 ميجابايت
  },
  fileFilter: fileFilter
});

module.exports = upload;