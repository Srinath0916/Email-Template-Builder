const bcrypt = require('bcrypt');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateOTP,
  hashOTP,
  getRefreshTokenCookieOptions,
  getAccessTokenCookieOptions,
  OTP_EXPIRY
} = require('../utils/tokenUtils');
const { sendOTPEmail } = require('../utils/emailService');

/**
 * Signup - Create new user account
 */
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      passwordHash,
      name,
      refreshTokens: []
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token in database
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    user.refreshTokens.push({
      tokenHash,
      issuedAt: new Date(),
      expiresAt,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    // Optionally set access token as cookie (or send in response)
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken // Also send in response for client-side storage if needed
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login - Authenticate user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash,
      issuedAt: new Date(),
      expiresAt,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Clean up expired tokens
    user.refreshTokens = user.refreshTokens.filter(
      token => token.expiresAt > new Date()
    );

    await user.save();

    // Set cookies
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Refresh - Get new access token using refresh token (with rotation)
 */
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if refresh token exists in database
    const tokenHash = hashToken(refreshToken);
    const tokenIndex = user.refreshTokens.findIndex(
      t => t.tokenHash === tokenHash && t.expiresAt > new Date()
    );

    if (tokenIndex === -1) {
      return res.status(401).json({ message: 'Refresh token not valid or expired' });
    }

    // ROTATION: Remove old refresh token
    user.refreshTokens.splice(tokenIndex, 1);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Store new refresh token
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: newTokenHash,
      issuedAt: new Date(),
      expiresAt,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    await user.save();

    // Set new cookies
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
    res.cookie('accessToken', newAccessToken, getAccessTokenCookieOptions());

    res.json({
      message: 'Token refreshed',
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Logout - Revoke refresh token and clear cookies
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      
      if (decoded) {
        const user = await User.findById(decoded.userId);
        
        if (user) {
          // Remove refresh token from database
          const tokenHash = hashToken(refreshToken);
          user.refreshTokens = user.refreshTokens.filter(
            t => t.tokenHash !== tokenHash
          );
          await user.save();
        }
      }
    }

    // Clear cookies
    res.clearCookie('refreshToken', getRefreshTokenCookieOptions());
    res.clearCookie('accessToken', getAccessTokenCookieOptions());

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Forgot Password - Send OTP to email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account exists with this email, an OTP has been sent' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY);

    // Store OTP in database
    user.otp = {
      codeHash: otpHash,
      expiresAt
    };

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.name);

    res.json({ 
      message: 'If an account exists with this email, an OTP has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Verify OTP - Check if OTP is valid
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user || !user.otp || !user.otp.codeHash) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP expired
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    const otpHash = hashOTP(otp);
    if (otpHash !== user.otp.codeHash) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Generate one-time reset token (short-lived)
    const resetToken = generateAccessToken(user._id);

    res.json({ 
      message: 'OTP verified successfully',
      resetToken // Use this token for password reset
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Reset Password - Change password after OTP verification
 */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify reset token
    const decoded = verifyRefreshToken(resetToken);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({ email, _id: decoded.userId });
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    // Clear OTP
    user.otp = undefined;

    // Revoke all refresh tokens (force re-login)
    user.refreshTokens = [];

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current user info
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -refreshTokens -otp');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getMe
};
