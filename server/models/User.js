const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
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
  otp: {
    codeHash: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
