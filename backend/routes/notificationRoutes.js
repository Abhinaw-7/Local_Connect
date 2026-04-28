const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markSingleAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getNotifications);

router.route('/read')
  .put(protect, markAsRead);

router.route('/:id/read')
  .put(protect, markSingleAsRead);

module.exports = router;
