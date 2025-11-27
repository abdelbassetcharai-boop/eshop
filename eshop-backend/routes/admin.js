const express = require('express');
const {
  getDashboardStats, getUsers, getVendorsList, approveVendor, getPayoutRequests, processPayout,
  getStoreSettings, updateStoreSettings,
  getAllPayments // الدالة الجديدة
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/vendors', getVendorsList);
router.put('/vendors/:userId/approve', approveVendor);
router.get('/payouts', getPayoutRequests);
router.put('/payouts/:payoutId/process', processPayout);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);

// مسار المدفوعات الجديد
router.get('/payments', getAllPayments);

module.exports = router;