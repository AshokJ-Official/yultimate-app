const Prediction = require('../models/Prediction');
const Match = require('../models/Match');

// Create prediction
exports.createPrediction = async (req, res) => {
  try {
    const { matchId, predictedWinner, predictedScore, confidence } = req.body;
    
    const match = await Match.findById(matchId);
    if (!match || (match.status !== 'scheduled' && match.status !== 'in_progress')) {
      return res.status(400).json({ success: false, message: 'Match not available for predictions' });
    }

    const prediction = await Prediction.findOneAndUpdate(
      { user: req.user.id, match: matchId },
      {
        predictedWinner,
        predictedScore,
        confidence: confidence || 3
      },
      { upsert: true, new: true }
    ).populate('match predictedWinner', 'teamA teamB name');

    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user predictions
exports.getUserPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.user.id })
      .populate('match', 'teamA teamB scheduledTime status score')
      .populate('predictedWinner', 'name')
      .populate('match.teamA match.teamB', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get match predictions
exports.getMatchPredictions = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const predictions = await Prediction.find({ match: matchId })
      .populate('user', 'name')
      .populate('predictedWinner', 'name');

    const stats = await Prediction.aggregate([
      { $match: { match: mongoose.Types.ObjectId(matchId) } },
      { $group: {
        _id: '$predictedWinner',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      }},
      { $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'team'
      }}
    ]);

    res.json({ success: true, data: { predictions, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Prediction.aggregate([
      { $group: {
        _id: '$user',
        totalPoints: { $sum: '$points' },
        totalPredictions: { $sum: 1 },
        correctPredictions: { $sum: { $cond: ['$isCorrect', 1, 0] } }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $addFields: {
        accuracy: { $divide: ['$correctPredictions', '$totalPredictions'] }
      }},
      { $sort: { totalPoints: -1 } },
      { $limit: 20 }
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};