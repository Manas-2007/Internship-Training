const express = require('express');
const { getHomeData, getCategories, getProducts, getProductById } = require('../controllers/productController');
const router = express.Router();

router.get('/home', getHomeData);
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;