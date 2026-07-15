const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Deal", dealSchema);
