const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversations,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations/all')
  .get(protect, getConversations);

router.route('/:userId')
  .get(protect, getMessages);

module.exports = router;
