const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  rules: String,
  bannerImage: String,
  sponsors: [{
    name: String,
    logo: String,
    website: String
  }],
  fields: [{
    name: {
      type: String,
      required: true
    },
    location: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  format: {
    type: String,
    enum: ['round_robin', 'bracket', 'swiss'],
    default: 'round_robin'
  },
  maxTeams: Number,
  registrationDeadline: Date,
  entryFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  director: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitors: [{
    name: String,
    email: String,
    phone: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    allowSpectatorRegistration: {
      type: Boolean,
      default: true
    },
    enableLiveScoring: {
      type: Boolean,
      default: true
    },
    enableSpiritScoring: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tournament', tournamentSchema);