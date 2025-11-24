const express = require('express');
const { 
  signup, 
  login, 
  refresh, 
  logout, 
  forgotPassword, 
  verifyOTP, 
  resetPassword,
  getMe
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { 
  authLimiter, 
  forgotPasswordLimiter, 
  refreshLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', verifyToken, getMe);

module.exports = router;
