const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// 1. إعداد محرك التخزين (تحديد المجلد واسم الملف)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تأكد من وجود هذا المجلد يدوياً في السيرفر
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // تسمية فريدة للملف: اسم الحقل + التاريخ + رقم عشوائي + الامتداد
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. فلتر للتحقق من نوع الملف (صور + فيديو) بدقة عالية
const fileFilter = (req, file, cb) => {
  // قائمة الامتدادات المسموحة (للأمان الإضافي)
  const filetypes = /jpeg|jpg|png|gif|webp|mp4|webm|avi|mov|mkv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // التحقق من نوع المايم (Mime Type)
  // هذه الطريقة أفضل لأنها تقبل أي نوع يبدأ بـ image/ أو video/
  // مما يحل مشكلة اختلاف التسميات مثل video/x-matroska
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');

  if (extname && (isImage || isVideo)) {
    return cb(null, true); // قبول الملف
  } else {
    // طباعة سبب الرفض في التيرمينال للمساعدة في التصحيح
    console.log('Rejected file:', file.originalname, 'Type:', file.mimetype);
    cb(new ErrorResponse('Error: File type not allowed! Only images and videos.', 400), false);
  }
};

// 3. إعداد Multer النهائي
const upload = multer({
  storage: storage,
  limits: {
    // الحد الأقصى لحجم الملف: 100 ميجابايت
    // هذا كافٍ جداً لفيديوهات قصيرة (دقيقة واحدة) بجودة عالية
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;