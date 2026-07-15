const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: String,
    subcategory: [String],
    image: String,
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
