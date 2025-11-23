const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 1. تطبيق حماية تسجيل الدخول على جميع المسارات أدناه
// لا يمكن لأي زائر غير مسجل الوصول لأي من هذه الروابط
router.use(protect);

// --- مسارات المستخدم العادي ---
router.post('/', createOrder);       // إنشاء طلب جديد
router.get('/myorders', getMyOrders); // عرض طلباتي
router.get('/:id', getOrderById);    // عرض تفاصيل طلب معين

// --- مسارات الأدمن ---
// تتطلب صلاحية 'admin'
router.get('/', authorize('admin'), getAllOrders); // عرض كل الطلبات في النظام
router.put('/:id/status', authorize('admin'), updateOrderStatus); // تحديث حالة الطلب (شحن/توصيل)

module.exports = router;