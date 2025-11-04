const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: [
      'tournament_director',    // Full Admin - Full control over tournaments
      'team_manager',          // Team-Level Access - Manages team registration, rosters
      'player',               // Limited Read Access - Views schedules, results
      'volunteer',            // Field-Level Access - Inputs live scores, attendance
      'scoring_team',         // Sub-Admin Access - Validates data, ensures accuracy
      'sponsor',              // Read-Only Public Access - Branded dashboards
      'spectator',            // Public Access - Follows teams, live scores, polls
      'programme_director',
      'programme_manager',
      'coach',
      'reporting_team',
      'data_team',
      'coordinator'
    ],
    required: true
  },
  platform: {
    type: String,
    enum: ['tournament', 'coaching'],
    default: 'tournament'
  },
  phone: String,
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);