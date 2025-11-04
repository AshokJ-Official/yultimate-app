const SpiritScore = require('../models/SpiritScore');
const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Get all spirit scores
// @route   GET /api/spirit-scores
// @access  Public
exports.getAllSpiritScores = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const spiritScores = await SpiritScore.find()
      .populate('scoringTeam scoredTeam', 'name')
      .populate('submittedBy', 'name')
      .populate('match', 'tournament')
      .populate({
        path: 'match',
        populate: {
          path: 'tournament',
          select: 'title name'
        }
      })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpiritScore.countDocuments();

    res.status(200).json({
      success: true,
      count: spiritScores.length,
      total,
      data: spiritScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit spirit score
// @route   POST /api/spirit-scores
// @access  Private (Team Manager, Player)
exports.submitSpiritScore = async (req, res) => {
  try {
    const { matchId, scoredTeamId, scores, comments } = req.body;

    const match = await Match.findById(matchId).populate('teamA teamB');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Determine scoring team
    let scoringTeamId;
    if (match.teamA._id.toString() === scoredTeamId) {
      scoringTeamId = match.teamB._id;
    } else if (match.teamB._id.toString() === scoredTeamId) {
      scoringTeamId = match.teamA._id;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid scored team for this match'
      });
    }

    // Check if spirit score already submitted
    const existingScore = await SpiritScore.findOne({
      match: matchId,
      scoringTeam: scoringTeamId,
      scoredTeam: scoredTeamId
    });

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: 'Spirit score already submitted for this match'
      });
    }

    const spiritScore = await SpiritScore.create({
      match: matchId,
      scoringTeam: scoringTeamId,
      scoredTeam: scoredTeamId,
      submittedBy: req.user.id,
      scores,
      comments,
      isSubmitted: true,
      submittedAt: new Date()
    });

    // Update team's average spirit score
    await updateTeamSpiritStats(scoredTeamId);

    // Create spirit score update
    if (req.io) {
      const { createUpdate } = require('./updateController');
      try {
        const scoringTeam = await Team.findById(scoringTeamId);
        const scoredTeam = await Team.findById(scoredTeamId);
        
        await createUpdate({
          body: {
            type: 'spirit_score',
            title: 'Spirit Score Submitted',
            message: `${scoringTeam.name} submitted spirit score for ${scoredTeam.name} (${spiritScore.totalScore}/20)`,
            priority: 'low',
            targetAudience: 'teams',
            metadata: { 
              matchId: matchId,
              scoringTeamId: scoringTeamId,
              scoredTeamId: scoredTeamId,
              score: spiritScore.totalScore
            }
          },
          params: { tournamentId: match.tournament },
          user: { id: req.user.id },
          io: req.io
        });
      } catch (error) {
        console.error('Error creating spirit score update:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: spiritScore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get spirit scores for match
// @route   GET /api/matches/:matchId/spirit-scores
// @access  Public
exports.getSpiritScoresByMatch = async (req, res) => {
  try {
    const spiritScores = await SpiritScore.find({ match: req.params.matchId })
      .populate('scoringTeam scoredTeam', 'name')
      .populate('submittedBy', 'name')
      .populate('match', 'scheduledTime status');

    res.status(200).json({
      success: true,
      count: spiritScores.length,
      data: spiritScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get spirit scores for team
// @route   GET /api/teams/:teamId/spirit-scores
// @access  Public
exports.getSpiritScoresByTeam = async (req, res) => {
  try {
    const { type = 'received' } = req.query; // 'received' or 'given'

    let query = {};
    if (type === 'received') {
      query.scoredTeam = req.params.teamId;
    } else {
      query.scoringTeam = req.params.teamId;
    }

    const spiritScores = await SpiritScore.find(query)
      .populate('scoringTeam scoredTeam', 'name')
      .populate('match', 'scheduledTime teamA teamB')
      .sort({ submittedAt: -1 });

    // Calculate averages
    const totalScores = spiritScores.length;
    const averages = {
      rulesKnowledge: 0,
      foulsAndContact: 0,
      fairMindedness: 0,
      positiveAttitude: 0,
      communication: 0,
      total: 0
    };

    if (totalScores > 0) {
      spiritScores.forEach(score => {
        averages.rulesKnowledge += score.scores.rulesKnowledge;
        averages.foulsAndContact += score.scores.foulsAndContact;
        averages.fairMindedness += score.scores.fairMindedness;
        averages.positiveAttitude += score.scores.positiveAttitude;
        averages.communication += score.scores.communication;
        averages.total += score.totalScore;
      });

      Object.keys(averages).forEach(key => {
        averages[key] = (averages[key] / totalScores).toFixed(2);
      });
    }

    res.status(200).json({
      success: true,
      count: spiritScores.length,
      averages,
      data: spiritScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get comprehensive spirit score summary for team
// @route   GET /api/teams/:teamId/spirit-summary
// @access  Private
exports.getTeamSpiritSummary = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    // Get scores received (what others gave this team)
    const receivedScores = await SpiritScore.find({ scoredTeam: teamId })
      .populate('scoringTeam', 'name')
      .populate('match', 'scheduledTime teamA teamB')
      .sort({ submittedAt: -1 });

    // Get scores given (what this team gave to others)
    const givenScores = await SpiritScore.find({ scoringTeam: teamId })
      .populate('scoredTeam', 'name')
      .populate('match', 'scheduledTime teamA teamB')
      .sort({ submittedAt: -1 });

    // Calculate received averages
    const receivedAverages = calculateAverages(receivedScores);
    
    // Calculate given averages
    const givenAverages = calculateAverages(givenScores);

    res.status(200).json({
      success: true,
      received: {
        count: receivedScores.length,
        averages: receivedAverages,
        scores: receivedScores
      },
      given: {
        count: givenScores.length,
        averages: givenAverages,
        scores: givenScores
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate averages
const calculateAverages = (scores) => {
  if (scores.length === 0) {
    return {
      rulesKnowledge: 0,
      foulsAndContact: 0,
      fairMindedness: 0,
      positiveAttitude: 0,
      communication: 0,
      total: 0
    };
  }

  const totals = scores.reduce((acc, score) => {
    acc.rulesKnowledge += score.scores.rulesKnowledge;
    acc.foulsAndContact += score.scores.foulsAndContact;
    acc.fairMindedness += score.scores.fairMindedness;
    acc.positiveAttitude += score.scores.positiveAttitude;
    acc.communication += score.scores.communication;
    acc.total += score.totalScore;
    return acc;
  }, {
    rulesKnowledge: 0,
    foulsAndContact: 0,
    fairMindedness: 0,
    positiveAttitude: 0,
    communication: 0,
    total: 0
  });

  return {
    rulesKnowledge: (totals.rulesKnowledge / scores.length).toFixed(2),
    foulsAndContact: (totals.foulsAndContact / scores.length).toFixed(2),
    fairMindedness: (totals.fairMindedness / scores.length).toFixed(2),
    positiveAttitude: (totals.positiveAttitude / scores.length).toFixed(2),
    communication: (totals.communication / scores.length).toFixed(2),
    total: (totals.total / scores.length).toFixed(2)
  };
};

// @desc    Get spirit leaderboard for tournament
// @route   GET /api/tournaments/:tournamentId/spirit-leaderboard
// @access  Public
exports.getSpiritLeaderboard = async (req, res) => {
  try {
    const teams = await Team.find({ 
      tournament: req.params.tournamentId,
      status: 'approved'
    }).select('name stats.averageSpiritScore stats.gamesPlayed');

    // Sort by average spirit score
    const leaderboard = teams
      .filter(team => team.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.averageSpiritScore - a.stats.averageSpiritScore)
      .map((team, index) => ({
        rank: index + 1,
        team: {
          id: team._id,
          name: team.name
        },
        averageSpiritScore: team.stats.averageSpiritScore,
        gamesPlayed: team.stats.gamesPlayed
      }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check pending spirit scores for team
// @route   GET /api/teams/:teamId/pending-spirit-scores
// @access  Private (Team Manager)
exports.getPendingSpiritScores = async (req, res) => {
  try {
    // Find completed matches where team participated but hasn't submitted spirit scores
    const matches = await Match.find({
      $or: [
        { teamA: req.params.teamId },
        { teamB: req.params.teamId }
      ],
      status: 'completed'
    }).populate('teamA teamB', 'name');

    const pendingScores = [];

    for (const match of matches) {
      const isTeamA = match.teamA._id.toString() === req.params.teamId;
      const opponentTeam = isTeamA ? match.teamB : match.teamA;

      // Check if spirit score already submitted
      const existingScore = await SpiritScore.findOne({
        match: match._id,
        scoringTeam: req.params.teamId,
        scoredTeam: opponentTeam._id
      });

      if (!existingScore) {
        pendingScores.push({
          match: {
            id: match._id,
            scheduledTime: match.scheduledTime,
            teamA: match.teamA,
            teamB: match.teamB,
            score: match.score
          },
          opponentTeam: {
            id: opponentTeam._id,
            name: opponentTeam.name
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      count: pendingScores.length,
      data: pendingScores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check if team can play next match (spirit scores submitted)
// @route   GET /api/teams/:teamId/can-play-next
// @access  Private
exports.canTeamPlayNext = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    console.log('Checking eligibility for team:', teamId);
    
    // Find completed matches where team hasn't submitted spirit scores
    const pendingMatches = await Match.find({
      $or: [
        { teamA: teamId },
        { teamB: teamId }
      ],
      status: 'completed'
    }).populate('teamA teamB', 'name');
    
    console.log('Found', pendingMatches.length, 'completed matches for team:', teamId);

    const pendingScores = [];
    for (const match of pendingMatches) {
      const isTeamA = match.teamA._id.toString() === teamId;
      const opponentTeam = isTeamA ? match.teamB : match.teamA;
      
      console.log('Checking match:', match._id, 'opponent:', opponentTeam.name);

      const existingScore = await SpiritScore.findOne({
        match: match._id,
        scoringTeam: teamId,
        scoredTeam: opponentTeam._id
      });
      
      console.log('Existing spirit score found:', !!existingScore);

      if (!existingScore) {
        pendingScores.push({
          matchId: match._id,
          opponent: opponentTeam.name,
          scheduledTime: match.scheduledTime
        });
      }
    }
    
    console.log('Pending scores count:', pendingScores.length);

    const canPlay = pendingScores.length === 0;
    
    console.log('Team can play:', canPlay, 'Pending count:', pendingScores.length);

    res.status(200).json({
      success: true,
      canPlay,
      pendingCount: pendingScores.length,
      pendingScores,
      message: canPlay 
        ? 'Team can play next match' 
        : `Team must submit ${pendingScores.length} spirit score(s) before next match`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to update team spirit statistics
const updateTeamSpiritStats = async (teamId) => {
  try {
    const spiritScores = await SpiritScore.find({ scoredTeam: teamId });
    
    if (spiritScores.length === 0) return;

    const totalScore = spiritScores.reduce((sum, score) => sum + score.totalScore, 0);
    const averageScore = totalScore / spiritScores.length;

    await Team.findByIdAndUpdate(teamId, {
      'stats.averageSpiritScore': parseFloat(averageScore.toFixed(2)),
      'stats.totalSpiritScore': totalScore
    });
  } catch (error) {
    console.error('Error updating team spirit stats:', error);
  }
};