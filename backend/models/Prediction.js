const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  predictedWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  predictedScore: {
    teamA: { type: Number, default: 0 },
    teamB: { type: Number, default: 0 }
  },
  confidence: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  points: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: null
  }
}, {
  timestamps: true
});

predictionSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);