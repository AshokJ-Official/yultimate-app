const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  field: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  round: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  score: {
    teamA: {
      type: Number,
      default: 0
    },
    teamB: {
      type: Number,
      default: 0
    }
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  attendance: {
    teamA: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      present: {
        type: Boolean,
        default: false
      },
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      markedAt: Date
    }],
    teamB: [{
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
      },
      present: {
        type: Boolean,
        default: false
      },
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      markedAt: Date
    }]
  },
  officials: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['referee', 'scorer', 'observer']
    }
  }],
  photos: [{
    url: String,
    caption: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);