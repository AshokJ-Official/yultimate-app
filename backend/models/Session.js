const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['school', 'community', 'workshop'],
    required: true
  },
  location: {
    name: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assistantCoaches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  attendance: [{
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: true
    },
    present: {
      type: Boolean,
      default: false
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: Date,
    notes: String
  }],
  activities: [{
    name: String,
    description: String,
    duration: Number, // in minutes
    skillsFocused: [String]
  }],
  notes: String,
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
  weather: {
    condition: String,
    temperature: Number
  },
  equipmentUsed: [String],
  travelTime: {
    type: Number, // minutes
    default: 0
  },
  preparationTime: {
    type: Number, // minutes
    default: 0
  },
  communityVisit: {
    type: Boolean,
    default: false
  },
  visitType: {
    type: String,
    enum: ['school', 'community', 'home', 'workshop'],
    default: 'school'
  },
  totalChildren: {
    type: Number,
    default: 0
  },
  presentChildren: {
    type: Number,
    default: 0
  },
  attendanceRate: {
    type: Number,
    default: 0
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);