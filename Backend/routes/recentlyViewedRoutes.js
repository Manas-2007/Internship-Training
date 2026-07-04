const express = require('express');
const router = express.Router();
const { syncRecentlyViewed } = require('../controllers/recentlyViewedController');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.post('/sync', authMiddleware, syncRecentlyViewed);

module.exports = router;