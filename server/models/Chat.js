const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant'],
    default: 'user'
  },
  message: {
    type: String,
    required: true
  },
  isFavourite: {
    type: Boolean,
    default: false
  },
  metadata: {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template'
    },
    context: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isFavourite: 1 });

module.exports = mongoose.model('Chat', chatSchema);
