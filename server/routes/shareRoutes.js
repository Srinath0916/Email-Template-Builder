const express = require('express');
const { shareTemplate } = require('../controllers/shareController');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Protected route with rate limiting
router.post('/', verifyToken, apiLimiter, shareTemplate);

module.exports = router;
