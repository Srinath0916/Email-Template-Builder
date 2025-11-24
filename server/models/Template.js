const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  blocks: [{
    id: String,
    type: {
      type: String,
      enum: ['text', 'image', 'button', 'divider']
    },
    content: String,
    src: String,
    styles: {
      color: String,
      backgroundColor: String,
      fontSize: String,
      textAlign: String
    }
  }],
  thumbnailUrl: {
    type: String,
    default: ''
  },
  isFavourite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
templateSchema.index({ userId: 1, createdAt: -1 });
templateSchema.index({ userId: 1, isFavourite: 1 });

module.exports = mongoose.model('Template', templateSchema);
