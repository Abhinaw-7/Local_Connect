const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllCommunityUsers,
  getUserById,
  checkUsernameAvailability,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-username/:username', checkUsernameAvailability);
router.route('/me').get(protect, getUserProfile);
router.route('/profile').put(protect, updateUserProfile);
router.route('/users').get(protect, getAllCommunityUsers);
router.route('/users/:id').get(protect, getUserById);

module.exports = router;
