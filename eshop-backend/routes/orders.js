const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/orderController');
const auth = require  ('../middleware/auth');
const validate = require('../middleware/validationMiddleware'); // استيراد التحقق
const { orderSchemas } = require('../validation/schemas');       // استيراد المخططات

// كل routes الطلبات تحتاج مصادقة
router.use(auth);

router.post('/', validate(orderSchemas.createOrder), createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;