const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['youtube', 'instagram', 'facebook', 'twitter', 'tiktok', 'website']
  },
  type: {
    type: String,
    required: true,
    enum: ['livestream', 'post', 'story', 'event', 'page', 'video']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  url: {
    type: String,
    required: true
  },
  embedId: {
    type: String // For YouTube video IDs, Instagram post IDs, etc.
  },
  thumbnail: {
    type: String // URL to thumbnail image
  },
  isLive: {
    type: Boolean,
    default: false
  },
  scheduledTime: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  metadata: {
    duration: String,
    likes: Number,
    comments: Number,
    shares: Number
  }
}, {
  timestamps: true
});

socialMediaSchema.index({ tournament: 1, platform: 1 });
socialMediaSchema.index({ isLive: 1, scheduledTime: 1 });

module.exports = mongoose.model('SocialMedia', socialMediaSchema);