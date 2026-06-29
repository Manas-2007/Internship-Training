const express = require('express');
const { addToBag, getBag, removeFromBag, updateQuantity } = require('../controllers/bagController');
const router = express.Router();

router.post('/', addToBag);
router.get('/:userid', getBag);
router.delete('/:itemid', removeFromBag);
router.put('/:itemid', updateQuantity);

module.exports = router;