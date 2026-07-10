const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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

        // Update push token on login if changed
        if (pushToken && user.pushToken !== pushToken) {
            user.pushToken = pushToken;
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET , { expiresIn: '7d' });
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

exports.updatePushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;
        const userId = req.user.id || req.user._id; 

        if (!pushToken) {
            return res.status(400).json({ success: false, message: "Push token is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { pushToken: pushToken },
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Push token successfully updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};