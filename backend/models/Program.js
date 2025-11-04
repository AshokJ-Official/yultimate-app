const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['school', 'community', 'workshop'],
    required: true
  },
  description: {
    type: String,
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
  schedule: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String,
    duration: Number // in minutes
  },
  capacity: {
    min: {
      type: Number,
      default: 5
    },
    max: {
      type: Number,
      required: true
    }
  },
  ageRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  objectives: [String],
  activities: [String],
  requirements: [String],
  resources: {
    materials: [String],
    equipment: [String],
    space: String
  },
  staff: {
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coaches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    volunteers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  enrollment: {
    startDate: Date,
    endDate: Date,
    isOpen: {
      type: Boolean,
      default: true
    },
    currentCount: {
      type: Number,
      default: 0
    }
  },
  fees: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['one-time', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  tags: [String],
  images: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);