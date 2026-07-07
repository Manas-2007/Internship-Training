const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { enqueueRealTimeNotification, scheduleDelayedNotification } = require('../services/queueService');

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, pushToken } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, pushToken });
        await user.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password, pushToken } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ errors: [{ path: 'email', msg: 'No account found' }] });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ errors: [{ path: 'password', msg: 'Incorrect password' }] });

        if (pushToken && user.pushToken !== pushToken) {
            user.pushToken = pushToken;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'myntra_super_secret_key_123', { expiresIn: '7d' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// controllers/authController.js ke end mein add karein:

exports.updatePushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;
        
        // req.user JWT token middleware se aayega (Make sure it matches your payload, usually req.user.id)
        const userId = req.user.id || req.user._id; 

        if (!pushToken) {
            return res.status(400).json({ success: false, message: "Push token is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { pushToken: pushToken },
            { new: true } // Returns the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Push token successfully updated" });
    } catch (error) {
        console.error("Error updating push token:", error);
        res.status(500).json({ success: false, message: "Server error while updating push token" });
    }
};

// Test Function
exports.testPushSystem = async (req, res) => {
    try {
        // 1. Logged-in user ka token database se nikalna
        const userId = req.user.id || req.user._id; 
        const user = await User.findById(userId);

        if (!user || !user.pushToken) {
            return res.status(400).json({ success: false, message: "Aapke account mein push token nahi mila. App par wapas login karein." });
        }

        const token = user.pushToken;

        // 2. REAL-TIME NOTIFICATION (Order Placed scenario)
        await enqueueRealTimeNotification(
            token,
            "Order Confirmed! 🎉",
            "Your order has been placed successfully.",
            { url: "/orders" } // Click karne par app is page par jayegi
        );

        // 3. SCHEDULED NOTIFICATION (Cart Abandonment scenario)
        // Testing ke liye hum isko 1 minute baad bhej rahe hain (Asli app mein 'in 1 hour' likhenge)
        await scheduleDelayedNotification(
            'in 1 minute', 
            token,
            "Did you forget something? 🛒",
            "Your bag is waiting! Checkout now before it goes out of stock.",
            { url: "/bag" }
        );

        res.status(200).json({ 
            success: true, 
            message: "Dono notifications (Instant & 1-Min Delayed) queue mein add ho gaye!" 
        });

    } catch (error) {
        console.error("Test notification error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};