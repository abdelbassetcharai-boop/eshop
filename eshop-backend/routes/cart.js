const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validationMiddleware'); // استيراد التحقق
const { cartSchemas } = require('../validation/schemas');       // استيراد المخططات

// كل routes العربة تحتاج مصادقة
router.use(auth);

router.post('/', validate(cartSchemas.addToCart), addToCart);
router.get('/', getCart);
router.put('/:id', validate(cartSchemas.updateCart), updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;