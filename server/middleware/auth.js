const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Middleware to verify access token
 * Checks both cookie and Authorization header
 */
const verifyToken = (req, res, next) => {
  try {
    // Try to get token from cookie first
    let token = req.cookies.accessToken;

    // If not in cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach userId to request
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { verifyToken, optionalAuth };
