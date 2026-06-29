const express = require('express');
const { createOrder, getUserOrders } = require('../controllers/orderController');
const router = express.Router();

router.post('/create/:userId', createOrder);
router.get('/user/:userid', getUserOrders);

module.exports = router;