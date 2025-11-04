const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['announcement', 'match_start', 'match_end', 'score_update', 'spirit_score', 'team_registration', 'tournament_status', 'general', 'schedule_change', 'weather_alert', 'emergency']
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'teams', 'players', 'spectators', 'officials', 'volunteers', 'sponsors'],
    default: 'all'
  },
  metadata: {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    score: { team1: Number, team2: Number }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

updateSchema.index({ tournament: 1, createdAt: -1 });
updateSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Update', updateSchema);