const express = require('express');
const { getBanners, getBootstrap } = require('../controllers/systemController');

const router = express.Router();

// مسار جلب البنرات (للصفحة الرئيسية)
// GET /api/public/banners
router.get('/banners', getBanners);

// مسار جلب الإعدادات الأولية (عند تحميل التطبيق)
// GET /api/public/bootstrap
router.get('/bootstrap', getBootstrap);

module.exports = router;