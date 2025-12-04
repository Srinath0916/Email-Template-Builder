const bcrypt = require('bcrypt');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenCookieOptions,
  getAccessTokenCookieOptions
} = require('../utils/tokenUtils');

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

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Store new refresh token
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Remove old token first
    await User.findByIdAndUpdate(
      user._id,
      { $pull: { refreshTokens: { tokenHash } } }
    );
    
    // Then add new token
    await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          refreshTokens: {
            tokenHash: newTokenHash,
            issuedAt: new Date(),
            expiresAt,
            ip: req.ip,
            userAgent: req.headers['user-agent']
          }
        }
      }
    );

    // Set new cookies
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
    res.cookie('accessToken', newAccessToken, getAccessTokenCookieOptions());

    res.json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
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
  getMe
};

/**
 * Request Password Reset - Send OTP to email
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({ message: 'If the email exists, an OTP has been sent' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Store OTP with 10 minute expiry
    user.resetPasswordOTP = {
      code: hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    await user.save();

    // Send OTP email
    const { sendPasswordResetOTP } = require('../utils/emailService');
    const emailResult = await sendPasswordResetOTP(email, otp, user.name);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify OTP and Reset Password
 */
const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTP.code) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP expired
    if (new Date() > user.resetPasswordOTP.expiresAt) {
      user.resetPasswordOTP = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, user.resetPasswordOTP.code);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordOTP = undefined;
    
    // Clear all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change Password (for logged-in users)
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    
    // Clear all refresh tokens except current one for security
    const currentRefreshToken = req.cookies.refreshToken;
    if (currentRefreshToken) {
      const tokenHash = hashToken(currentRefreshToken);
      user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash === tokenHash);
    }
    
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  refresh,
  getMe,
  requestPasswordReset,
  resetPasswordWithOTP,
  changePassword
};
