const express = require('express');
const router = express.Router();
const { handlePaymentWebhook } = require('../controllers/webhookController');

router.post('/payment', handlePaymentWebhook);

module.exports = router;