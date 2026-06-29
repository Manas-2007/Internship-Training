const mongoose = require('mongoose');

const bagItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    quantity: Number,
}, { timestamps: true });

module.exports = mongoose.model('Bag', bagItemSchema);