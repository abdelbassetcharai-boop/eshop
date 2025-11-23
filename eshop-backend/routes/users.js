const express = require('express');
const { getUsers, getUser } = require('../controllers/userController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// حماية جميع المسارات وتخصيصها للأدمن فقط
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser);

module.exports = router;