const express = require('express');
const router = express.Router();
const { syncRecentlyViewed, getRecommendations } = require('../controllers/recentlyViewedController');
const authMiddleware = require('../middlewares/authMiddleware'); 

router.post('/sync', authMiddleware, syncRecentlyViewed);
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;