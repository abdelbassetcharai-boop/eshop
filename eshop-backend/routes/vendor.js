const express = require('express');
const {
  getVendorStats,
  getVendorOrders,
  requestPayout,
  getPayoutHistory
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { protectVendor, checkVendorApproval } = require('../middleware/vendorMiddleware');
const validate = require('../middleware/validationMiddleware');
const { payoutRequestSchema } = require('../validation/schemas');

const router = express.Router();

// 1. تطبيق الحماية الأساسية والتحقق من الدور (Vendor) على جميع المسارات
router.use(protect);
router.use(protectVendor);

// 2. تطبيق التحقق من موافقة المدير (Approval) على جميع مسارات لوحة التحكم
router.use(checkVendorApproval);

// --- مسارات لوحة تحكم البائع ---

// GET /api/vendor/stats
// جلب الإحصائيات (الرصيد، المبيعات، الطلبات المعلقة)
router.get('/stats', getVendorStats);

// GET /api/vendor/orders
// جلب قائمة الطلبات/عناصر الطلب المتعلقة بهذا البائع
router.get('/orders', getVendorOrders);

// --- مسارات سحب الأرباح ---

// POST /api/vendor/payouts
// تقديم طلب سحب رصيد (مع التحقق من صحة المبلغ)
router.post('/payouts', validate(payoutRequestSchema), requestPayout);

// GET /api/vendor/payouts
// جلب تاريخ طلبات السحب
router.get('/payouts', getPayoutHistory);


// ملاحظة: ستتم إضافة مسارات إدارة المنتجات لاحقاً ضمن ملف المنتجات لتجنب التكرار في مسارات المنتجات.

module.exports = router;