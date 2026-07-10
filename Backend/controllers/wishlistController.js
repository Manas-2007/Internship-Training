const Wishlist = require('../models/Wishlist');
const mongoose = require('mongoose');

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        const existing = await Wishlist.findOne({ userId, productId });
        if (existing) return res.status(400).json({ message: "Product already in wishlist" });
        
        const wishlistItem = new Wishlist({ userId, productId });
        await wishlistItem.save();
        
        res.status(200).json({ message: "Added to wishlist!" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Error adding to wishlist" });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const uid = req.params.userid;
        const wishlist = await Wishlist.find({ 
            userId: new mongoose.Types.ObjectId(uid) 
        }).populate("productId");
        
        res.status(200).json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Error fetching wishlist" });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const result = await Wishlist.deleteOne({ userId, productId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        res.status(200).json({ message: "Removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
};