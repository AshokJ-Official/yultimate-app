const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  category: {
    type: String,
    enum: ['highlight', 'sponsor', 'match', 'general'],
    default: 'general'
  },
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

mediaSchema.index({ tournament: 1, category: 1 });
mediaSchema.index({ tournament: 1, type: 1 });

module.exports = mongoose.model('Media', mediaSchema);