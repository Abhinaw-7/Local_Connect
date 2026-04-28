const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populatedMessage = await newMessage.populate('sender receiver', 'name username profilePhoto');

    // Create notification for the receiver
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: 'message',
      entityId: newMessage._id,
    });

    // Socket.io integration to emit message in real time
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('receive_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations (latest message per user)
// @route   GET /api/messages/conversations/all
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Aggregation to find users this user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          'user.username': 1,
          'user.profilePhoto': 1,
          lastMessage: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
};
