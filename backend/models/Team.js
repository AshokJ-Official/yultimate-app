const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactEmail: String,
  contactPhone: String,
  homeCity: String,
  players: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true
    },
    jerseyNumber: Number,
    isCaptain: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  logo: String,
  primaryColor: String,
  secondaryColor: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    pointsFor: {
      type: Number,
      default: 0
    },
    pointsAgainst: {
      type: Number,
      default: 0
    },
    averageSpiritScore: {
      type: Number,
      default: 0
    },
    totalSpiritScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);