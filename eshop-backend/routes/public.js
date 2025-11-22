const express = require('express');
const router = express.Router();
const { getSystemConfig } = require('../controllers/systemController');

// الرابط العام لجلب إعدادات النظام
router.get('/bootstrap', getSystemConfig);

module.exports = router;