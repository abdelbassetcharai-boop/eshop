const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateSystemSettings,
  getVendorsList,      // جديد: جلب قائمة البائعين
  approveVendor,       // جديد: اعتماد البائع
  getPayoutRequests,   // جديد: جلب طلبات السحب
  processPayout        // جديد: معالجة طلب السحب
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// تطبيق الحماية على جميع مسارات الأدمن
router.use(protect);
router.use(authorize('admin'));

// --- مسارات الإحصائيات والإعدادات العامة ---
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/settings', updateSystemSettings);

// --- مسارات إدارة البائعين (جديد) ---
// GET /api/admin/vendors: جلب قائمة البائعين
router.get('/vendors', getVendorsList);

// PUT /api/admin/vendors/:userId/approve: اعتماد حساب البائع
router.put('/vendors/:userId/approve', approveVendor);

// --- مسارات إدارة المدفوعات (جديد) ---
// GET /api/admin/payouts: جلب طلبات السحب المعلقة
router.get('/payouts', getPayoutRequests);

// PUT /api/admin/payouts/:payoutId/process: معالجة طلب سحب
router.put('/payouts/:payoutId/process', processPayout);

module.exports = router;