const Bag = require('../models/Bag');

exports.addToBag = async (req, res) => {
    try {
        const newBagItem = new Bag(req.body);
        const savedItem = await newBagItem.save();
        res.status(200).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: "Error adding to bag" });
    }
};

exports.getBag = async (req, res) => {
    try {
        const bag = await Bag.find({ userId: req.params.userid }).populate("productId");
        res.status(200).json(bag);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bag" });
    }
};

exports.removeFromBag = async (req, res) => {
    try {
        await Bag.findByIdAndDelete(req.params.itemid);
        res.status(200).json({ message: "Item removed from bag" });
    } catch (error) {
        res.status(500).json({ message: "Error removing item" });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        await Bag.findByIdAndUpdate(req.params.itemid, { quantity: req.body.quantity });
        res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating quantity" });
    }
};