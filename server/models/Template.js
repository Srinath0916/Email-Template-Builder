const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'button', 'divider', 'spacer', 'columns']
  },
  content: mongoose.Schema.Types.Mixed,
  src: String,
  styles: mongoose.Schema.Types.Mixed,
  order: Number
}, { _id: false, strict: false });

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  blocks: [blockSchema],
  globalStyles: {
    backgroundColor: { type: String, default: '#ffffff' },
    fontFamily: { type: String, default: 'Arial, sans-serif' },
    maxWidth: { type: String, default: '600px' },
    padding: { type: String, default: '20px' }
  },
  isFavourite: {
    type: Boolean,
    default: false
  },
  thumbnail: String,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
templateSchema.index({ userId: 1, isFavourite: 1 });
templateSchema.index({ userId: 1, createdAt: -1 });

// Update lastModified on save
templateSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Template', templateSchema);
