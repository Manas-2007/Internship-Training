const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactionController');
const { exportTransactionsCSV, downloadReceiptPDF } = require('../controllers/exportController');
const protect = require('../middlewares/authMiddleware'); 

router.get('/', protect, getTransactions);
router.get('/export/csv', protect, exportTransactionsCSV);
router.get('/export/pdf/:id', protect, downloadReceiptPDF);

module.exports = router;