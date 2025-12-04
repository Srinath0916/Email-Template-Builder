const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  refreshTokens: [{
    tokenHash: String,
    issuedAt: Date,
    expiresAt: Date,
    ip: String,
    userAgent: String
  }],
  resetPasswordOTP: {
    code: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('User', userSchema);
