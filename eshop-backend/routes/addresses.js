const express = require('express');
const router = express.Router();
const {
  addAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', addAddress);
router.get('/', getUserAddresses);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;