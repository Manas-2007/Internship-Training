const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware'); 
const router = express.Router();

router.post('/register', [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please enter a valid E-mail').isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 })
], registerUser);

router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;