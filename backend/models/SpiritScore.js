const mongoose = require('mongoose');

const spiritScoreSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  scoringTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  scoredTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scores: {
    rulesKnowledge: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    },
    foulsAndContact: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    },
    fairMindedness: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    },
    positiveAttitude: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    },
    communication: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    }
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 20,
    default: 10
  },
  comments: {
    type: String,
    maxlength: 500
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: Date
}, {
  timestamps: true
});

// Calculate total score before saving
spiritScoreSchema.pre('save', function(next) {
  this.totalScore = this.scores.rulesKnowledge + 
                   this.scores.foulsAndContact + 
                   this.scores.fairMindedness + 
                   this.scores.positiveAttitude + 
                   this.scores.communication;
  next();
});

module.exports = mongoose.model('SpiritScore', spiritScoreSchema);