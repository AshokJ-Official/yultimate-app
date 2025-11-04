const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Player = require('../models/Player');
const SpiritScore = require('../models/SpiritScore');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// @desc    Create tournament
// @route   POST /api/tournaments
// @access  Private (Tournament Director)
exports.createTournament = async (req, res) => {
  try {
    console.log('Tournament creation request:', req.body);
    console.log('User:', req.user);
    
    req.body.director = req.user.id;
    const tournament = await Tournament.create(req.body);

    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('Tournament creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
  try {
    const { status, year, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const tournaments = await Tournament.find(query)
      .populate('director', 'name email')
      .sort({ startDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add team counts to each tournament
    const tournamentsWithTeamCounts = await Promise.all(
      tournaments.map(async (tournament) => {
        const teamCount = await Team.countDocuments({ 
          tournament: tournament._id,
          status: { $in: ['pending', 'approved'] }
        });
        return {
          ...tournament.toObject(),
          registeredTeams: teamCount
        };
      })
    );

    const total = await Tournament.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tournaments.length,
      total,
      data: tournamentsWithTeamCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single tournament
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('director', 'name email phone');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Tournament Director)
exports.updateTournament = async (req, res) => {
  try {
    let tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if user is tournament director
    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament'
      });
    }

    tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Tournament Director)
exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if user is tournament director
    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tournament'
      });
    }

    await tournament.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Register visitor for tournament
// @route   POST /api/tournaments/:id/visitors
// @access  Public
exports.registerVisitor = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (!tournament.settings.allowSpectatorRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Visitor registration is not allowed for this tournament'
      });
    }

    const { name, email, phone } = req.body;

    // Check if visitor already registered
    const existingVisitor = tournament.visitors.find(v => v.email === email);
    if (existingVisitor) {
      return res.status(400).json({
        success: false,
        message: 'Visitor already registered'
      });
    }

    tournament.visitors.push({ name, email, phone });
    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Visitor registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get tournament dashboard data
// @route   GET /api/tournaments/:id/dashboard
// @access  Private
exports.getTournamentDashboard = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const teams = await Team.find({ tournament: req.params.id }).populate('players.player');
    const matches = await Match.find({ tournament: req.params.id }).populate('teamA teamB');

    const dashboardData = {
      tournament,
      stats: {
        totalTeams: teams.length,
        totalPlayers: teams.reduce((acc, team) => acc + team.players.length, 0),
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'completed').length,
        totalVisitors: tournament.visitors.length
      },
      recentMatches: matches.slice(-5),
      upcomingMatches: matches.filter(m => m.status === 'scheduled').slice(0, 5)
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload tournament banner
// @route   POST /api/tournaments/:id/banner
// @access  Private (Tournament Director)
exports.uploadBanner = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload banner for this tournament'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    tournament.bannerImage = req.file.path;
    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Banner uploaded successfully',
      data: {
        bannerUrl: req.file.path
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

// @desc    Send real-time update
// @route   POST /api/tournaments/:id/updates
// @access  Private (Tournament Director)
exports.sendRealTimeUpdate = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send updates for this tournament'
      });
    }

    const { type, title, message, priority } = req.body;
    const updateData = {
      type,
      title,
      message,
      priority,
      timestamp: new Date(),
      tournamentId: req.params.id
    };

    // Emit real-time update to all tournament participants
    req.io.to(`tournament-${req.params.id}`).emit('tournament-update', updateData);

    res.status(200).json({
      success: true,
      message: 'Update sent successfully',
      data: updateData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get historical tournament data
// @route   GET /api/tournaments/history
// @access  Public
exports.getHistoricalData = async (req, res) => {
  try {
    const { year, status = 'completed' } = req.query;
    
    let query = { status };
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.endDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const tournaments = await Tournament.find(query)
      .populate('director', 'name')
      .sort({ endDate: -1 });

    const historicalData = await Promise.all(tournaments.map(async (tournament) => {
      const teams = await Team.find({ tournament: tournament._id });
      const matches = await Match.find({ tournament: tournament._id, status: 'completed' });
      const winner = teams.find(team => team.stats?.wins > 0) || teams[0];

      return {
        _id: tournament._id,
        title: tournament.title,
        date: tournament.endDate,
        location: tournament.location,
        teams: teams.length,
        matches: matches.length,
        winner: winner?.name || 'TBD',
        status: tournament.status,
        director: tournament.director?.name
      };
    }));

    res.status(200).json({
      success: true,
      count: historicalData.length,
      data: historicalData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export tournament data
// @route   GET /api/tournaments/:id/export
// @access  Private (Tournament Director)
exports.exportTournamentData = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('director', 'name email');
    const teams = await Team.find({ tournament: req.params.id }).populate('players.player');
    const matches = await Match.find({ tournament: req.params.id }).populate('teamA teamB');

    const exportData = {
      tournament: {
        title: tournament.title,
        description: tournament.description,
        location: tournament.location,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        status: tournament.status,
        director: tournament.director?.name
      },
      teams: teams.map(team => ({
        name: team.name,
        players: team.players.length,
        status: team.status
      })),
      matches: matches.map(match => ({
        teamA: match.teamA?.name,
        teamB: match.teamB?.name,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        status: match.status,
        date: match.scheduledDate
      })),
      statistics: {
        totalTeams: teams.length,
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'completed').length
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${tournament.title}-export.json"`);
    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export match data as CSV
// @route   GET /api/tournaments/:id/export/matches
// @access  Private (Tournament Director)
exports.exportMatchesCSV = async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.id })
      .populate('teamA teamB', 'name')
      .populate('tournament', 'title');

    const csvData = matches.map(match => ({
      matchId: match._id,
      teamA: match.teamA?.name || 'TBD',
      teamB: match.teamB?.name || 'TBD',
      scoreA: match.score?.teamA || 0,
      scoreB: match.score?.teamB || 0,
      winner: match.winner ? (match.winner.toString() === match.teamA?._id.toString() ? match.teamA.name : match.teamB?.name) : 'Draw',
      field: match.field,
      round: match.round,
      status: match.status,
      scheduledTime: match.scheduledTime,
      actualStartTime: match.actualStartTime,
      actualEndTime: match.actualEndTime
    }));

    const csvString = convertToCSV(csvData, [
      { id: 'matchId', title: 'Match ID' },
      { id: 'teamA', title: 'Team A' },
      { id: 'teamB', title: 'Team B' },
      { id: 'scoreA', title: 'Score A' },
      { id: 'scoreB', title: 'Score B' },
      { id: 'winner', title: 'Winner' },
      { id: 'field', title: 'Field' },
      { id: 'round', title: 'Round' },
      { id: 'status', title: 'Status' },
      { id: 'scheduledTime', title: 'Scheduled Time' },
      { id: 'actualStartTime', title: 'Start Time' },
      { id: 'actualEndTime', title: 'End Time' }
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="matches.csv"');
    res.status(200).send(csvString);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export player stats as CSV
// @route   GET /api/tournaments/:id/export/players
// @access  Private (Tournament Director)
exports.exportPlayersCSV = async (req, res) => {
  try {
    const teams = await Team.find({ tournament: req.params.id })
      .populate({
        path: 'players.player',
        select: 'name email age gender phone position experience'
      });

    const csvData = [];
    teams.forEach(team => {
      team.players.forEach(playerData => {
        if (playerData.player) {
          csvData.push({
            playerName: playerData.player.name,
            email: playerData.player.email,
            age: playerData.player.age,
            gender: playerData.player.gender,
            phone: playerData.player.phone,
            position: playerData.player.position,
            experience: playerData.player.experience,
            teamName: team.name,
            jerseyNumber: playerData.jerseyNumber,
            isCaptain: playerData.isCaptain ? 'Yes' : 'No',
            isActive: playerData.isActive ? 'Yes' : 'No'
          });
        }
      });
    });

    const csvString = convertToCSV(csvData, [
      { id: 'playerName', title: 'Player Name' },
      { id: 'email', title: 'Email' },
      { id: 'age', title: 'Age' },
      { id: 'gender', title: 'Gender' },
      { id: 'phone', title: 'Phone' },
      { id: 'position', title: 'Position' },
      { id: 'experience', title: 'Experience' },
      { id: 'teamName', title: 'Team' },
      { id: 'jerseyNumber', title: 'Jersey #' },
      { id: 'isCaptain', title: 'Captain' },
      { id: 'isActive', title: 'Active' }
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="players.csv"');
    res.status(200).send(csvString);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export team stats as CSV
// @route   GET /api/tournaments/:id/export/teams
// @access  Private (Tournament Director)
exports.exportTeamsCSV = async (req, res) => {
  try {
    const teams = await Team.find({ tournament: req.params.id })
      .populate('manager', 'name email');

    const csvData = teams.map(team => ({
      teamName: team.name,
      manager: team.manager?.name || 'N/A',
      managerEmail: team.manager?.email || 'N/A',
      contactEmail: team.contactEmail,
      contactPhone: team.contactPhone,
      homeCity: team.homeCity,
      status: team.status,
      playersCount: team.players.length,
      gamesPlayed: team.stats.gamesPlayed,
      wins: team.stats.wins,
      losses: team.stats.losses,
      draws: team.stats.draws,
      pointsFor: team.stats.pointsFor,
      pointsAgainst: team.stats.pointsAgainst,
      pointDifference: team.stats.pointsFor - team.stats.pointsAgainst,
      averageSpiritScore: team.stats.averageSpiritScore,
      registrationDate: team.registrationDate
    }));

    const csvString = convertToCSV(csvData, [
      { id: 'teamName', title: 'Team Name' },
      { id: 'manager', title: 'Manager' },
      { id: 'managerEmail', title: 'Manager Email' },
      { id: 'contactEmail', title: 'Contact Email' },
      { id: 'contactPhone', title: 'Contact Phone' },
      { id: 'homeCity', title: 'Home City' },
      { id: 'status', title: 'Status' },
      { id: 'playersCount', title: 'Players Count' },
      { id: 'gamesPlayed', title: 'Games Played' },
      { id: 'wins', title: 'Wins' },
      { id: 'losses', title: 'Losses' },
      { id: 'draws', title: 'Draws' },
      { id: 'pointsFor', title: 'Points For' },
      { id: 'pointsAgainst', title: 'Points Against' },
      { id: 'pointDifference', title: 'Point Difference' },
      { id: 'averageSpiritScore', title: 'Avg Spirit Score' },
      { id: 'registrationDate', title: 'Registration Date' }
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teams.csv"');
    res.status(200).send(csvString);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  if (!data.length) return '';
  
  const csvHeaders = headers.map(h => h.title).join(',');
  const csvRows = data.map(row => 
    headers.map(h => {
      const value = row[h.id];
      return value !== null && value !== undefined ? `"${value}"` : '""';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// @desc    Update tournament fields
// @route   PUT /api/tournaments/:id/fields
// @access  Private (Tournament Director)
exports.updateFields = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update fields for this tournament'
      });
    }

    tournament.fields = req.body.fields;
    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Fields updated successfully',
      data: tournament.fields
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update tournament status
// @route   PUT /api/tournaments/:id/status
// @access  Private (Tournament Director)
exports.updateTournamentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'open', 'ongoing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.director.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tournament status'
      });
    }

    const oldStatus = tournament.status;
    tournament.status = status;
    await tournament.save();

    // Create tournament status update
    if (req.io && oldStatus !== status) {
      const { createUpdate } = require('./updateController');
      try {
        const statusMessages = {
          'open': 'Tournament is now open for registration',
          'ongoing': 'Tournament has started!',
          'completed': 'Tournament has been completed',
          'cancelled': 'Tournament has been cancelled'
        };
        
        await createUpdate({
          body: {
            type: 'tournament_status',
            title: 'Tournament Status Update',
            message: statusMessages[status] || `Tournament status changed to ${status}`,
            priority: status === 'ongoing' ? 'high' : 'medium',
            targetAudience: 'all'
          },
          params: { tournamentId: req.params.id },
          user: { id: req.user.id },
          io: req.io
        });
      } catch (error) {
        console.error('Error creating tournament status update:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Tournament status updated successfully',
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get tournament leaderboard
// @route   GET /api/tournaments/:id/leaderboard
// @access  Public
exports.getTournamentLeaderboard = async (req, res) => {
  try {
    const teams = await Team.find({ 
      tournament: req.params.id,
      status: 'approved'
    }).select('name stats');

    if (!teams.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Calculate points (3 for win, 1 for draw, 0 for loss)
    const leaderboard = teams.map(team => {
      const points = (team.stats.wins * 3) + (team.stats.draws * 1);
      const pointDifference = team.stats.pointsFor - team.stats.pointsAgainst;
      
      return {
        team: {
          id: team._id,
          name: team.name
        },
        gamesPlayed: team.stats.gamesPlayed,
        wins: team.stats.wins,
        losses: team.stats.losses,
        draws: team.stats.draws,
        points,
        pointsFor: team.stats.pointsFor,
        pointsAgainst: team.stats.pointsAgainst,
        pointDifference,
        averageSpiritScore: team.stats.averageSpiritScore || 0
      };
    });

    // Sort by: 1) Points, 2) Point difference, 3) Points for, 4) Spirit score
    leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
      if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
      return b.averageSpiritScore - a.averageSpiritScore;
    });

    // Add rank
    const rankedLeaderboard = leaderboard.map((team, index) => ({
      rank: index + 1,
      ...team
    }));

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      data: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};