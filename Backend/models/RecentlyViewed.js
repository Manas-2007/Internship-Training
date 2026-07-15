const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
          index: { expires: "30d" },
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
