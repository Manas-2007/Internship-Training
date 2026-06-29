const express = require('express');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const protect = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protect, addToWishlist); 
router.get('/:userid', getWishlist);
router.delete('/product/:productId', protect, removeFromWishlist);

module.exports = router;