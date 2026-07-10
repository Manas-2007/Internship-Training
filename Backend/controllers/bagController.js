const Bag = require('../models/Bag');
const User = require('../models/User'); 
const { scheduleDelayedNotification } = require('../services/queueService'); 

exports.addToBag = async (req, res) => {
    try {
        const { userId, productId, size, quantity } = req.body;

        // Check if item already exists in cart to prevent duplicates
        let existingItem = await Bag.findOne({ userId, productId, size });

        if (existingItem) {
            existingItem.quantity += (quantity || 1);
            existingItem.status = 'active'; // Move back to active if it was saved
            await existingItem.save(); // Triggers optimistic locking check
            return res.status(200).json(existingItem);
        }

        const newBagItem = new Bag(req.body);
        const savedItem = await newBagItem.save();

        // Schedule an abandoned cart notification for 2 hours later
        try {
            if (userId) {
                const user = await User.findById(userId);
                if (user && user.pushToken) {
                    await scheduleDelayedNotification(
                        'in 2 hours', 
                        user.pushToken,
                        "Forgot something? 🛒",
                        "You left great items in your bag. Complete your purchase before they sell out!",
                        { url: "/bag" } 
                    );
                }
            }
        } catch (notificationError) {
            console.error("Failed to schedule abandoned cart notification");
        }

        res.status(200).json(savedItem);
    } catch (error) {
        console.error("Add to bag error:", error);
        res.status(500).json({ message: "Error adding to bag" });
    }
};

exports.getBag = async (req, res) => {
    try {
        const bag = await Bag.find({ userId: req.params.userid }).populate("productId");
        
        // Segregate Active and Saved Items for the Frontend
        const activeItems = bag.filter(item => item.status === 'active');
        const savedItems = bag.filter(item => item.status === 'saved');

        res.status(200).json({ 
            activeItems, 
            savedItems, 
            totalActiveItems: activeItems.length 
        });
    } catch (error) {
        console.error("Get bag error:", error);
        res.status(500).json({ message: "Error fetching bag" });
    }
};

// 👇 NAYA FUNCTION: Toggle Save for Later
exports.toggleItemStatus = async (req, res) => {
    try {
        const item = await Bag.findById(req.params.itemid);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.status = item.status === 'active' ? 'saved' : 'active';
        
        await item.save(); // Triggers optimistic concurrency check
        res.status(200).json({ message: `Item moved to ${item.status}`, item });
        
    } catch (error) {
        // Handle Concurrency Conflict
        if (error.name === 'VersionError') {
            return res.status(409).json({ message: "Conflict: Cart was updated in another session. Please refresh." });
        }
        res.status(500).json({ message: "Error updating item status" });
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

// 👇 UPDATED: Concurrency-Safe Quantity Update
exports.updateQuantity = async (req, res) => {
    try {
        // findByIdAndUpdate use nahi karenge, warna lock bypass ho jayega
        const item = await Bag.findById(req.params.itemid);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.quantity = req.body.quantity;
        await item.save(); // Triggers __v version check

        res.status(200).json({ message: "Quantity updated successfully", item });
    } catch (error) {
        // Handle Concurrency Conflict
        if (error.name === 'VersionError') {
            return res.status(409).json({ message: "Conflict: Quantity was changed by another device. Please refresh." });
        }
        res.status(500).json({ message: "Error updating quantity" });
    }
};

// 👇 NAYA FUNCTION: Cart Validation Before Checkout
exports.validateCheckout = async (req, res) => {
    try {
        const activeItems = await Bag.find({ userId: req.params.userid, status: 'active' }).populate("productId");

        if (activeItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        let issues = [];
        let validTotal = 0;

        for (const item of activeItems) {
            const product = item.productId;
            
            // 1. Detect Discontinued/Deleted Products
            if (!product) {
                issues.push("An item in your cart is no longer available and has been removed.");
                await Bag.findByIdAndDelete(item._id); // Graceful cleanup
                continue; 
            }

            // 2. Validate Stock (Assumes product schema has 'stock' or handles lack of it)
            const stockLimit = product.stock !== undefined ? product.stock : 10; // dummy fallback
            if (item.quantity > stockLimit) {
                issues.push(`${product.name || 'Product'} only has ${stockLimit} units left in stock.`);
            }

            // Calculate active total safely using the LATEST price from the Product DB
            validTotal += (product.price * item.quantity);
        }

        if (issues.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "Cart requires attention before checkout.", 
                issues 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Cart is valid.", 
            cartTotal: validTotal 
        });

    } catch (error) {
        console.error("Checkout Validation Error:", error);
        res.status(500).json({ message: "Error validating cart" });
    }
};