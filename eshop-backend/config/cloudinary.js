const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// سجل (Log) لحالة التهيئة
console.log(`Cloudinary Status: ${cloudinary.config().cloud_name ? 'Ready' : 'MISSING CONFIG'}`);
if (!cloudinary.config().cloud_name) {
    console.error("CRITICAL ERROR: Cloudinary credentials are not set correctly in .env");
}

// إعداد تخزين Multer مع Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'eshop_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'],
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image', // تحديد نوع المورد
    };
  },
});

module.exports = {
  cloudinary,
  storage
};