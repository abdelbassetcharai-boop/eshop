const express = require('express');
const { getDashboardStats, getUsers, updateSystemSettings } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/settings', updateSystemSettings);

module.exports = router;