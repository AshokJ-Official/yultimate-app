const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const SpiritScore = require('../models/SpiritScore');
const Follow = require('../models/Follow');
const { createMatchUpdate } = require('./updateController');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
exports.getAllMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const matches = await Match.find(query)
      .populate('tournament', 'title name')
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .sort({ scheduledTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Match.countDocuments(query);

    res.status(200).json({
      success: true,
      count: matches.length,
      total,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create match schedule
// @route   POST /api/matches
// @access  Private (Tournament Director)
exports.createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    await match.populate('teamA teamB tournament');

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get matches for tournament
// @route   GET /api/tournaments/:tournamentId/matches
// @access  Public
exports.getMatchesByTournament = async (req, res) => {
  try {
    const { field, status, date, page = 1, limit = 20 } = req.query;
    
    let query = { tournament: req.params.tournamentId };
    if (field) query.field = field;
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const matches = await Match.find(query)
      .populate('teamA teamB', 'name logo')
      .populate('tournament', 'title')
      .sort({ scheduledTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Match.countDocuments(query);

    res.status(200).json({
      success: true,
      count: matches.length,
      total,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Public
exports.getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'teamA teamB',
        select: 'name logo players stats',
        populate: {
          path: 'players.player',
          select: 'name email age gender phone position experience'
        }
      })
      .populate('tournament', 'title startDate endDate')
      .populate('officials.user', 'name')
      .populate('attendance.teamA.player attendance.teamB.player', 'name email')
      .populate('photos.uploadedBy', 'name');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update match score
// @route   PUT /api/matches/:id/score
// @access  Private (Volunteer, Scoring Team)
exports.updateMatchScore = async (req, res) => {
  try {
    const { teamAScore, teamBScore } = req.body;

    const match = await Match.findById(req.params.id).populate('teamA teamB');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if teams have submitted required spirit scores before starting match
    if (match.status === 'scheduled') {
      const teamAEligible = await checkTeamEligibility(match.teamA._id);
      const teamBEligible = await checkTeamEligibility(match.teamB._id);

      if (!teamAEligible.canPlay) {
        return res.status(400).json({
          success: false,
          message: `${match.teamA.name} must submit ${teamAEligible.pendingCount} spirit score(s) before playing`,
          pendingScores: teamAEligible.pendingScores
        });
      }

      if (!teamBEligible.canPlay) {
        return res.status(400).json({
          success: false,
          message: `${match.teamB.name} must submit ${teamBEligible.pendingCount} spirit score(s) before playing`,
          pendingScores: teamBEligible.pendingScores
        });
      }
    }

    match.score.teamA = teamAScore;
    match.score.teamB = teamBScore;

    // Determine winner
    if (teamAScore > teamBScore) {
      match.winner = match.teamA;
      match.isDraw = false;
    } else if (teamBScore > teamAScore) {
      match.winner = match.teamB;
      match.isDraw = false;
    } else {
      match.winner = null;
      match.isDraw = true;
    }

    // Update match status
    if (match.status === 'scheduled') {
      match.status = 'in_progress';
      match.actualStartTime = new Date();
      
      // Create match start update
      if (req.io) {
        createMatchUpdate(match._id, 'match_start', { userId: req.user.id, targetAudience: 'all' }, req.io);
      }
    }

    await match.save();

    // Create score update
    if (req.io) {
      createMatchUpdate(match._id, 'score_update', { 
        userId: req.user.id, 
        score: { team1: teamAScore, team2: teamBScore },
        targetAudience: 'all'
      }, req.io);
      
      // Notify team followers
      notifyTeamFollowers(match, 'score_update', { score: { team1: teamAScore, team2: teamBScore } }, req.io);
    }

    // Update team stats
    await updateTeamStats(match);

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete match
// @route   PUT /api/matches/:id/complete
// @access  Private (Volunteer, Scoring Team)
exports.completeMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    match.status = 'completed';
    match.actualEndTime = new Date();

    await match.save();

    // Create match end update
    if (req.io) {
      createMatchUpdate(match._id, 'match_end', { 
        userId: req.user.id, 
        score: { team1: match.score.teamA, team2: match.score.teamB },
        targetAudience: 'all'
      }, req.io);
      
      // Notify team followers
      notifyTeamFollowers(match, 'match_end', { 
        score: { team1: match.score.teamA, team2: match.score.teamB },
        winner: match.winner
      }, req.io);
    }

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark attendance for match
// @route   PUT /api/matches/:id/attendance
// @access  Private (Volunteer, Team Manager)
exports.markAttendance = async (req, res) => {
  try {
    const { team, playerId, present } = req.body;
    
    console.log('Marking attendance:', { team, playerId, present });

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Initialize attendance arrays if they don't exist
    if (!match.attendance) {
      match.attendance = { teamA: [], teamB: [] };
    }
    if (!match.attendance.teamA) match.attendance.teamA = [];
    if (!match.attendance.teamB) match.attendance.teamB = [];

    const attendanceArray = team === 'A' ? match.attendance.teamA : match.attendance.teamB;
    const playerAttendance = attendanceArray.find(a => a.player && a.player.toString() === playerId);

    if (playerAttendance) {
      playerAttendance.present = present;
      playerAttendance.markedBy = req.user.id;
      playerAttendance.markedAt = new Date();
    } else {
      attendanceArray.push({
        player: playerId,
        present,
        markedBy: req.user.id,
        markedAt: new Date()
      });
    }

    await match.save();

    // Emit real-time attendance update
    if (req.io) {
      req.io.to(`match-${req.params.id}`).emit('attendance-updated', {
        matchId: req.params.id,
        playerId,
        team,
        present,
        markedBy: req.user.id,
        markedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: `Player marked as ${present ? 'present' : 'absent'}`,
      data: match
    });
  } catch (error) {
    console.error('Attendance marking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload match photos
// @route   POST /api/matches/:id/photos
// @access  Private
exports.uploadMatchPhotos = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => ({
        url: file.path, // Cloudinary URL
        caption: file.originalname,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      }));

      match.photos.push(...newPhotos);
    } else {
      // Handle JSON data (legacy support)
      const { photos } = req.body;
      if (photos && Array.isArray(photos)) {
        const newPhotos = photos.map(photo => ({
          ...photo,
          uploadedBy: req.user.id,
          uploadedAt: new Date()
        }));
        match.photos.push(...newPhotos);
      }
    }

    await match.save();

    res.status(200).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get live matches
// @route   GET /api/matches/live
// @access  Public
exports.getLiveMatches = async (req, res) => {
  try {
    const matches = await Match.find({ status: 'in_progress' })
      .populate('teamA teamB', 'name logo')
      .populate('tournament', 'title')
      .sort({ actualStartTime: -1 });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to check if team can play (has submitted required spirit scores)
const checkTeamEligibility = async (teamId) => {
  try {
    const pendingMatches = await Match.find({
      $or: [
        { teamA: teamId },
        { teamB: teamId }
      ],
      status: 'completed'
    }).populate('teamA teamB', 'name');

    const pendingScores = [];
    for (const match of pendingMatches) {
      const isTeamA = match.teamA._id.toString() === teamId.toString();
      const opponentTeam = isTeamA ? match.teamB : match.teamA;

      const existingScore = await SpiritScore.findOne({
        match: match._id,
        scoringTeam: teamId,
        scoredTeam: opponentTeam._id
      });

      if (!existingScore) {
        pendingScores.push({
          matchId: match._id,
          opponent: opponentTeam.name,
          scheduledTime: match.scheduledTime
        });
      }
    }

    return {
      canPlay: pendingScores.length === 0,
      pendingCount: pendingScores.length,
      pendingScores
    };
  } catch (error) {
    console.error('Error checking team eligibility:', error);
    return { canPlay: true, pendingCount: 0, pendingScores: [] };
  }
};

// Helper function to update team stats
const updateTeamStats = async (match) => {
  try {
    const teamA = await Team.findById(match.teamA);
    const teamB = await Team.findById(match.teamB);

    // Update games played
    teamA.stats.gamesPlayed += 1;
    teamB.stats.gamesPlayed += 1;

    // Update points
    teamA.stats.pointsFor += match.score.teamA;
    teamA.stats.pointsAgainst += match.score.teamB;
    teamB.stats.pointsFor += match.score.teamB;
    teamB.stats.pointsAgainst += match.score.teamA;

    // Update wins/losses/draws
    if (match.winner) {
      if (match.winner.toString() === teamA._id.toString()) {
        teamA.stats.wins += 1;
        teamB.stats.losses += 1;
      } else {
        teamB.stats.wins += 1;
        teamA.stats.losses += 1;
      }
    } else {
      teamA.stats.draws += 1;
      teamB.stats.draws += 1;
    }

    await teamA.save();
    await teamB.save();
  } catch (error) {
    console.error('Error updating team stats:', error);
  }
};

// Helper function to notify team followers
const notifyTeamFollowers = async (match, eventType, data, io) => {
  try {
    const teamAFollowers = await Follow.find({ team: match.teamA, 'notifications.matchUpdates': true })
      .populate('fan', 'name');
    const teamBFollowers = await Follow.find({ team: match.teamB, 'notifications.matchUpdates': true })
      .populate('fan', 'name');

    const allFollowers = [...teamAFollowers, ...teamBFollowers];
    
    allFollowers.forEach(follow => {
      io.to(`user-${follow.fan._id}`).emit('team-update', {
        type: eventType,
        match: {
          id: match._id,
          teamA: match.teamA,
          teamB: match.teamB
        },
        data,
        timestamp: new Date()
      });
    });
  } catch (error) {
    console.error('Error notifying team followers:', error);
  }
};