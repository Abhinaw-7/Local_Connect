const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  deleteItem,
  getItemsByUser,
} = require('../controllers/marketplaceController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/user/:id', protect, getItemsByUser);

router.route('/')
  .post(protect, createItem)
  .get(protect, getItems);

router.route('/:id')
  .get(protect, getItemById)
  .put(protect, updateItemStatus)
  .delete(protect, deleteItem);

module.exports = router;
