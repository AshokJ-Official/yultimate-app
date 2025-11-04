const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  fan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  notifications: {
    matchUpdates: { type: Boolean, default: true },
    spiritScores: { type: Boolean, default: true },
    teamNews: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true }
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate follows
followSchema.index({ fan: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);