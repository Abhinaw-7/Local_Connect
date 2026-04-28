const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username profilePhoto')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark specific notification as read (and others from same sender if it's a message)
// @route   PUT /api/notifications/:id/read
// @access  Private
const markSingleAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Mark the clicked one
    notification.read = true;
    await notification.save();

    // If it's a message, mark all other unread notifications from this sender as read too
    if (notification.type === 'message') {
      await Notification.updateMany(
        { 
          recipient: req.user._id, 
          sender: notification.sender, 
          type: 'message', 
          read: false 
        },
        { $set: { read: true } }
      );
    }

    res.json({ message: 'Notification(s) marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markSingleAsRead,
};
