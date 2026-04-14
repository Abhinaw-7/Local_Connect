const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  deletePost,
  toggleLikePost,
  addComment,
  getPostsByUser,
} = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/user/:userId').get(protect, getPostsByUser);

router.route('/:id')
  .delete(protect, deletePost);

router.route('/:id/like').put(protect, toggleLikePost);
router.route('/:id/comments').post(protect, addComment);

module.exports = router;
