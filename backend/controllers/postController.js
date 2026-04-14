const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { type, content, images, location, urgency } = req.body;

    const newPost = await Post.create({
      author: req.user._id,
      type,
      content,
      images,
      location: location || req.user.location, // default to user's location
      urgency,
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby posts (local-first with fallback)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const { type, pincode, city, area } = req.query;

    let baseQuery = {};
    if (type) baseQuery.type = type;

    const populateOpts = [
      { path: 'author', select: 'name profilePhoto location' },
      { path: 'comments.user', select: 'name profilePhoto' },
    ];

    // Determine user's location for smart filtering
    const userPincode = pincode || req.user?.location?.pincode;
    const userCity = city || req.user?.location?.city;
    const userArea = area || req.user?.location?.area;

    // Strategy 1: Try pincode (most local)
    if (userPincode) {
      const localPosts = await Post.find({ ...baseQuery, 'location.pincode': userPincode })
        .populate(populateOpts)
        .sort({ createdAt: -1 });

      if (localPosts.length > 0) {
        return res.json({ posts: localPosts, scope: 'pincode', location: userPincode });
      }
    }

    // Strategy 2: Try city + area
    if (userCity) {
      const cityQuery = { ...baseQuery, 'location.city': userCity };
      if (userArea) cityQuery['location.area'] = userArea;

      const cityPosts = await Post.find(cityQuery)
        .populate(populateOpts)
        .sort({ createdAt: -1 });

      if (cityPosts.length > 0) {
        return res.json({ posts: cityPosts, scope: 'city', location: userCity });
      }
    }

    // Strategy 3: Show all posts (global fallback)
    const allPosts = await Post.find(baseQuery)
      .populate(populateOpts)
      .sort({ createdAt: -1 });

    res.json({ posts: allPosts, scope: 'all', location: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like / Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user._id);

    if (index === -1) {
      post.likes.push(req.user._id);
      
      // Send Notification (if not liking own post)
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          entityId: post._id,
        });
      }
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details for the new comment
    await post.populate('comments.user', 'name profilePhoto');

    // Send Notification
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        entityId: post._id,
      });
    }

    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:userId
// @access  Private
const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name profilePhoto location')
      .populate('comments.user', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  deletePost,
  toggleLikePost,
  addComment,
  getPostsByUser,
};
