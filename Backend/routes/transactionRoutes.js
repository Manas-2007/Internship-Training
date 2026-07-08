const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware'); 

// 👇 YEH 2 LINES ADD KARO CHECK KARNE KE LIYE
console.log("Middleware check:", verifyToken);
console.log("Controller check:", getTransactions);

// Ek hi route hona chahiye
router.get('/', verifyToken, getTransactions);

module.exports = router;