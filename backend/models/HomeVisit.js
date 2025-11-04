const mongoose = require('mongoose');

const homeVisitSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  visitTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  purpose: {
    type: String,
    enum: ['initial_assessment', 'follow_up', 'family_engagement', 'academic_support', 'behavioral_support', 'community_visit', 'other'],
    required: true
  },
  // Community Visit specific fields
  uin: String,
  community: {
    type: String,
    enum: ['Abhas(Tugalkabad)', 'Garhi', 'Karm Marg(Faridabad)', 'Pushp Vihar', 'Saket', 'Zamrudpur', 'Mehrauli', 'Sanjay Colony(LBL)', 'Seemapuri']
  },
  team: {
    type: String,
    enum: ['Abhas B1', 'Abhas B2', 'Abhas B3', 'Abhas B4', 'Zamrudpur B1', 'Zamrudpur B2', 'Zamrudpur B3', 'Zamrudpur B4', 'Zamrudpur B5', 'Mehrauli B1', 'Mehrauli B2', 'Saket B1', 'Garhi B1', 'Seemapuri', 'LBL']
  },
  visitedWith: String,
  comesHomeOnTime: {
    type: String,
    enum: ['Yes', 'No']
  },
  lateReason: String,
  studiesProgress: String,
  childBehaviorAtHome: String,
  schoolRegularity: String,
  parentFeedback: String,
  feedbackType: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral', 'Both Positive and Negative']
  },
  overallHomeSituation: String,
  attendees: [{
    name: String,
    relationship: String,
    age: Number
  }],
  observations: {
    homeEnvironment: String,
    familyDynamics: String,
    childBehavior: String,
    academicSupport: String,
    challenges: String
  },
  discussions: [{
    topic: String,
    details: String,
    outcome: String
  }],
  actionItems: [{
    description: String,
    assignedTo: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  nextVisitDate: Date,
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mobilizationPhotos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  travelTime: {
    type: Number, // in minutes
    default: 0
  },
  travelDistance: {
    type: Number, // in kilometers
    default: 0
  },
  notes: String,
  status: {
    type: String,
    enum: ['planned', 'completed', 'cancelled', 'rescheduled'],
    default: 'planned'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  scheduledDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomeVisit', homeVisitSchema);