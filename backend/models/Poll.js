const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voters: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    option: { type: Number, required: true },
    votedAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Poll', pollSchema);