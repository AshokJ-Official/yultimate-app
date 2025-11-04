const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  assessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessorName: {
    type: String,
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true
  },
  dateOfJoining: Date,
  dateOfBirth: Date,
  apparentAge: String,
  languageDifficulty: String,
  coachingSite: {
    type: String,
    required: true
  },
  lsasScores: {
    interactingWithOthers: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    },
    overcomingDifficulties: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    },
    takingInitiative: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    },
    managingConflict: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    },
    understandingInstructions: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    },
    overallScore: {
      score: {
        type: Number,
        min: 0,
        max: 5
      },
      comments: String,
      anyComment: String
    }
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 30
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 5
  },
  extraNotes: String,
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

// Calculate total and average scores before saving
assessmentSchema.pre('save', function(next) {
  const scores = this.lsasScores;
  let total = 0;
  let count = 0;
  
  Object.keys(scores).forEach(key => {
    if (scores[key] && scores[key].score !== undefined) {
      total += scores[key].score;
      count++;
    }
  });
  
  this.totalScore = total;
  this.averageScore = count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);