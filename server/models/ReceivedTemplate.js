const mongoose = require('mongoose');

const receivedTemplateSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  receivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
receivedTemplateSchema.index({ receiverId: 1, receivedAt: -1 });
receivedTemplateSchema.index({ receiverId: 1, status: 1 });

module.exports = mongoose.model('ReceivedTemplate', receivedTemplateSchema);
