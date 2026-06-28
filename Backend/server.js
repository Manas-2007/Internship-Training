const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const jwt=require('jsonwebtoken');
const dns=require('dns');
dns.setServers(['1.1.1.1','8.8.8.8']);

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

// 🛍️ NEW DATABASE MODELS (MYNTRA CLONE)

// 1. PRODUCT MODEL
const productSchema = new mongoose.Schema({
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    images: [String],
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

// 2. CATEGORY MODEL
const categorySchema = new mongoose.Schema({
    name: String,
    subcategory: [String],
    image: String,
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
}, { timestamps: true });
const Category = mongoose.model('Category', categorySchema);

// 1. ADD DEAL MODEL (Category aur Product ke paas isko daal do)
const dealSchema = new mongoose.Schema({
    title: String,
    image: String,
}, { timestamps: true });
const Deal = mongoose.model('Deal', dealSchema);

// 3. WISHLIST MODEL
const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
}, { timestamps: true });
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// 4. BAG/CART MODEL 
const bagItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    quantity: Number,
}, { timestamps: true });
const Bag = mongoose.model('Bag', bagItemSchema);

// 5. ORDER MODEL
const timelineSchema = new mongoose.Schema({
    status: String,
    location: String,
    timestamp: String,
});

const trackingSchema = new mongoose.Schema({
    number: String,
    carrier: String,
    estimatedDelivery: String,
    currentLocation: String,
    status: String,
    timeline: [timelineSchema],
});

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    price: Number,
    quantity: Number,
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    status: String,
    items: [orderItemSchema],
    total: Number,
    shippingAddress: String,
    paymentMethod: String,
    tracking: trackingSchema,
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

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

// GET USER PROFILE API 
app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "No token, authorization denied" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myntra_super_secret_key_123');
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
});

// ==========================================
// 🛍️ PRODUCTS & CATEGORIES APIs
// ==========================================

// Get all Categories
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Category.find().populate("productId");
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
});

// Get all Products
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
});

// Get single Product by ID
app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product details" });
    }
});

// ==========================================
// 🛒 BAG (CART) APIs
// ==========================================

// Add item to Bag
app.post("/api/bag", async (req, res) => {
    try {
        const newBagItem = new Bag(req.body);
        const savedItem = await newBagItem.save();
        res.status(200).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: "Error adding to bag" });
    }
});

// Get User's Bag
app.get("/api/bag/:userid", async (req, res) => {
    try {
        const bag = await Bag.find({ userId: req.params.userid }).populate("productId");
        res.status(200).json(bag);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bag" });
    }
});

// Remove item from Bag
app.delete("/api/bag/:itemid", async (req, res) => {
    try {
        await Bag.findByIdAndDelete(req.params.itemid);
        res.status(200).json({ message: "Item removed from bag" });
    } catch (error) {
        res.status(500).json({ message: "Error removing item" });
    }
});

// ==========================================
// ❤️ WISHLIST APIs (Fixed logical routes)
// ==========================================
// Naya "Smart" POST route
app.post("/api/wishlist", async (req, res) => {
    try {
        // 1. Token nikalo request header se
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Auth token missing" });

        // 2. Token decode karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myntra_super_secret_key_123');
        const userId = decoded.id; // Token ke andar 'id' hoti hai

        // 3. Ab data save karo (userId automatically mil gaya!)
        const { productId } = req.body;
        const wishlistItem = new Wishlist({ userId, productId });
        await wishlistItem.save();
        
        res.status(200).json({ message: "Added to wishlist!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding to wishlist" });
    }
});

app.get("/api/wishlist/:userid", async (req, res) => {
    try {
        const uid = req.params.userid;

        // YAHAN HAI ASLI FIX: String ko ObjectId mein convert karna
        const wishlist = await Wishlist.find({ 
            userId: new mongoose.Types.ObjectId(uid) 
        }).populate("productId");
        
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: "Error fetching wishlist", error: error.message });
    }
});

// YAHAN ERROR THA: Is route ko replace karo
app.delete('/api/wishlist/product/:productId', async (req, res) => {
    try {
        // 1. ASLI FIX: Token nikal kar manually decode karna padega
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Auth token missing" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myntra_super_secret_key_123');
        const userId = decoded.id; // Ab userId perfectly mil jayega!

        const { productId } = req.params;

        // 2. Delete item from database
        const result = await Wishlist.deleteOne({ userId, productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }

        res.status(200).json({ message: "Removed from wishlist" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete" });
    }
});

// ==========================================
// 📦 ORDERS APIs
// ==========================================

// Helper function for dummy tracking (Placed outside API)
function generateRandomTracking() {
    const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
    const statusOptions = ["Shipped", "Out for Delivery", "Delivered", "In Transit"];
    const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
    
    return {
        number: "TRK" + Math.floor(Math.random() * 10000000),
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: locations[Math.floor(Math.random() * locations.length)],
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        timeline: [
            { status: "Order placed", location: "Warehouse", timestamp: new Date().toISOString() }
        ],
    };
}

// Create Order (Checkout)
app.post("/api/orders/create/:userId", async (req, res) => {
    try {
        const userid = req.params.userId;
        
        // 1. Get all items from user's bag
        const bag = await Bag.find({ userId: userid }).populate("productId");
        if (bag.length === 0) return res.status(400).json({ message: "Bag is empty" });

        // 2. Format items for order
        const orderItems = bag.map((item) => ({
            productId: item.productId._id,
            size: item.size,
            price: item.productId.price,
            quantity: item.quantity,
        }));

        // 3. Calculate total (Fixed logic from tutorial: price * quantity)
        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // 4. Create Order
        const newOrder = new Order({
            userId: userid,
            date: new Date().toISOString(),
            status: "Processing",
            items: orderItems,
            total: total,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            tracking: generateRandomTracking(),
        });

        await newOrder.save();
        
        // 5. Clear the Bag after order
        await Bag.deleteMany({ userId: userid });
        
        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error placing order" });
    }
});

// Get User's Orders
app.get("/api/orders/user/:userid", async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userid }).populate("items.productId");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Update Item Quantity in Bag
app.put("/api/bag/:itemid", async (req, res) => {
    try {
        const { quantity } = req.body;
        await Bag.findByIdAndUpdate(req.params.itemid, { quantity: quantity });
        res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating quantity" });
    }
});

// Home API for Myntra Clone
app.get("/api/home", async (req, res) => {
    try {
        const [categories, deals, products] = await Promise.all([
            Category.find().limit(10),
            Deal.find().limit(5),
            Product.find().limit(20) // Trending ke liye top 20
        ]);

        res.status(200).json({ categories, deals, products });
    } catch (error) {
        console.error("Home Data Fetch Error:", error);
        res.status(500).json({ message: "Error fetching home data" });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is Live at PORT ${PORT}`);
});