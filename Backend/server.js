const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const helmet = require("helmet");
const dns = require("dns");
// Environment setup
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const bagRoutes = require("./routes/bagRoutes");
const orderRoutes = require("./routes/orderRoutes");
const recentlyViewedRoutes = require("./routes/recentlyViewedRoutes");
const {
  startQueue,
  enqueueRealTimeNotification,
} = require("./services/queueService");
const notificationRoutes = require("./routes/notificationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();
startQueue();

//  API Routes
app.get("/", (req, res) =>
  res.send("Myntra Clone Backend is Working (MVC Architecture)"),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/bag", bagRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/recently-viewed", recentlyViewedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is Live at PORT ${PORT}`);
});
