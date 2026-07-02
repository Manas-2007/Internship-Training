const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const dns = require('dns');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bagRoutes = require('./routes/bagRoutes');
const orderRoutes = require('./routes/orderRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');

// Environment setup
dotenv.config();
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();

// 2. Middlewares
app.use(helmet()); 
app.use(cors());
app.use(express.json()); 

// 3. Database Connection 
connectDB();

// 4. API Routes 
app.get('/', (req, res) => res.send('Myntra Clone Backend is Working (MVC Architecture)'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', productRoutes);         
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/bag', bagRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is Live at PORT ${PORT}`);
});