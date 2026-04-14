const MarketplaceItem = require('../models/MarketplaceItem');

// @desc    List a new item
// @route   POST /api/marketplace
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, price, images, category, location } = req.body;

    const newItem = await MarketplaceItem.create({
      seller: req.user._id,
      title,
      description,
      price,
      images,
      category,
      location: location || req.user.location,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all nearby marketplace items (local-first with fallback)
// @route   GET /api/marketplace
// @access  Private
const getItems = async (req, res) => {
  try {
    const { category, city, area, pincode } = req.query;

    let baseQuery = { status: 'available' };
    if (category) baseQuery.category = category;

    const populateOpts = { path: 'seller', select: 'name profilePhoto phone location' };

    const userPincode = pincode || req.user?.location?.pincode;
    const userCity = city || req.user?.location?.city;
    const userArea = area || req.user?.location?.area;

    // Try pincode first
    if (userPincode) {
      const localItems = await MarketplaceItem.find({ ...baseQuery, 'location.pincode': userPincode })
        .populate(populateOpts).sort({ createdAt: -1 });
      if (localItems.length > 0) {
        return res.json({ items: localItems, scope: 'pincode', location: userPincode });
      }
    }

    // Try city
    if (userCity) {
      const cityQuery = { ...baseQuery, 'location.city': userCity };
      if (userArea) cityQuery['location.area'] = userArea;
      const cityItems = await MarketplaceItem.find(cityQuery)
        .populate(populateOpts).sort({ createdAt: -1 });
      if (cityItems.length > 0) {
        return res.json({ items: cityItems, scope: 'city', location: userCity });
      }
    }

    // Fallback: all items
    const allItems = await MarketplaceItem.find(baseQuery)
      .populate(populateOpts).sort({ createdAt: -1 });
    res.json({ items: allItems, scope: 'all', location: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get item details
// @route   GET /api/marketplace/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name profilePhoto phone location');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item status (e.g. mark as sold)
// @route   PUT /api/marketplace/:id
// @access  Private
const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await MarketplaceItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.status = status || item.status;
    const updatedItem = await item.save();

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete marketplace item
// @route   DELETE /api/marketplace/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.deleteOne();

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all marketplace items listed by a specific user
// @route   GET /api/marketplace/user/:id
// @access  Private
const getItemsByUser = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ seller: req.params.id })
      .populate('seller', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  deleteItem,
  getItemsByUser,
};
