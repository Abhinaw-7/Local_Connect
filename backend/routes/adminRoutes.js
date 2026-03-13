const express = require('express');
const router = express.Router();
const { toggleBanUser, getAllUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/users')
  .get(protect, admin, getAllUsers);

router.route('/users/:id/ban')
  .put(protect, admin, toggleBanUser);

module.exports = router;
