const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const jwt=require('jsonwebtoken');

dotenv.config();
const app = express();

// --- SECURITY & MIDDLEWARES ---
app.use(helmet()); 
app.use(cors());
app.use(express.json()); 

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Successfully Connected");
    })
    .catch(err => {
        console.error("Connection Error:", err.message);
    });

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('Myntra Clone Backend is Working');
});

// SIGNUP API endpoint
app.post('/api/auth/register', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please enter a valid E-mail').isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 })
], async (req, res) => {
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this E-mail" });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create new user instance
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        // 4. Save user to database
        await user.save();

        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// LOGIN API
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ path: 'email', msg: 'No account found with this email' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ path: 'password', msg: 'Incorrect password' }] });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'myntra_super_secret_key_123', 
            { expiresIn: '7d' } 
        );

        res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is Live at PORT ${PORT}`);
});