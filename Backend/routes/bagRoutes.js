const express = require("express");
const {
  addToBag,
  getBag,
  removeFromBag,
  updateQuantity,
  toggleItemStatus,
  validateCheckout,
} = require("../controllers/bagController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/toggle-status/:itemid", authMiddleware, toggleItemStatus);
router.get("/validate/:userid", authMiddleware, validateCheckout);
router.post("/", authMiddleware, addToBag);
router.get("/:userid", authMiddleware, getBag);
router.delete("/:itemid", authMiddleware, removeFromBag);
router.put("/:itemid", authMiddleware, updateQuantity);

module.exports = router;
