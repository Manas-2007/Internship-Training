const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    images: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
