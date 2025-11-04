const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  age: {
    type: Number,
    min: 16,
    max: 60
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  phone: String,
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'professional'],
    default: 'beginner'
  },
  position: {
    type: String,
    enum: ['handler', 'cutter', 'hybrid'],
    default: 'hybrid'
  },
  height: Number, // in cm
  weight: Number, // in kg
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    conditions: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);