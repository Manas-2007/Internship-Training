const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  status: String,
  location: String,
  timestamp: String,
});

const trackingSchema = new mongoose.Schema({
  number: String,
  carrier: String,
  estimatedDelivery: String,
  currentLocation: String,
  status: String,
  timeline: [timelineSchema],
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  size: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    status: String,
    items: [orderItemSchema],
    total: Number,
    shippingAddress: String,
    paymentMethod: String,
    tracking: trackingSchema,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
