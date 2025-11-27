const express = require('express');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// حماية جميع المسارات (يجب أن يكون المستخدم مسجلاً للدخول ولديه توكن)
router.use(protect);

router.route('/')
  .get(getAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

module.exports = router;