const express = require("express");
const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");
const protect = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create/:userId", protect, createOrder);
router.get("/user/:userid", protect, getUserOrders);

module.exports = router;
