const mongoose = require('mongoose');

const coachWorkloadSchema = new mongoose.Schema({
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  sessions: [{
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    startTime: Date,
    endTime: Date,
    travelTime: {
      type: Number, // minutes
      default: 0
    },
    preparationTime: {
      type: Number, // minutes
      default: 0
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  homeVisits: [{
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HomeVisit'
    },
    startTime: Date,
    endTime: Date,
    travelTime: {
      type: Number, // minutes
      default: 0
    }
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  totalTravelTime: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CoachWorkload', coachWorkloadSchema);