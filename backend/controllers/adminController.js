const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Ban or Unban User
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban an admin' });
    }

    user.status = user.status === 'active' ? 'banned' : 'active';
    await user.save();

    res.json({ message: `User status changed to ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users (for moderation)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  toggleBanUser,
  getAllUsers
};
