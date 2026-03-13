const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    images: {
      type: [String],
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      city: String,
      area: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
