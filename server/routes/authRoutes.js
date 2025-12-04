const express = require('express');
const { 
  signup, 
  login, 
  refresh, 
  logout,
  getMe,
  requestPasswordReset,
  resetPasswordWithOTP,
  changePassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { 
  authLimiter, 
  refreshLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes with rate limiting
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);

// Password reset routes
router.post('/forgot-password', authLimiter, requestPasswordReset);
router.post('/reset-password', authLimiter, resetPasswordWithOTP);

// Protected routes
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
