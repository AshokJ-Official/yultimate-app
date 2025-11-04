const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dateOfBirth: Date,
  guardianName: {
    type: String,
    required: true
  },
  guardianPhone: {
    type: String,
    required: true
  },
  guardianEmail: String,
  address: {
    type: String,
    required: true
  },
  school: {
    name: String,
    grade: String,
    section: String
  },
  community: {
    name: String,
    location: String
  },
  programme: {
    type: String,
    required: true
  },
  programmes: [{
    type: {
      type: String,
      enum: ['school', 'community', 'workshop'],
      required: true
    },
    location: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  transferHistory: [{
    fromLocation: String,
    toLocation: String,
    transferDate: Date,
    reason: String,
    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  photo: String,
  medicalInfo: {
    allergies: String,
    medications: String,
    conditions: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    attendedSessions: {
      type: Number,
      default: 0
    },
    attendanceRate: {
      type: Number,
      default: 0
    },
    homeVisits: {
      type: Number,
      default: 0
    },
    assessments: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Child', childSchema);