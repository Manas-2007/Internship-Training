const express = require('express');
// 👇 Naye functions ko yahan import list mein add kiya
const { 
    addToBag, 
    getBag, 
    removeFromBag, 
    updateQuantity, 
    toggleItemStatus, 
    validateCheckout 
} = require('../controllers/bagController');

const router = express.Router();

// 🟢 Specific routes hamesha upar aate hain
router.put('/toggle-status/:itemid', toggleItemStatus);
router.get('/validate/:userid', validateCheckout);

// 🔵 Dynamic ID wale routes uske neeche aate hain
router.post('/', addToBag);
router.get('/:userid', getBag);
router.delete('/:itemid', removeFromBag);
router.put('/:itemid', updateQuantity);

module.exports = router;