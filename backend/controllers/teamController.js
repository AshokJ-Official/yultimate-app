const Team = require('../models/Team');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getAllTeams = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('manager', 'name email phone')
      .populate('players.player', 'name email age gender phone position experience')
      .populate('tournament', 'title startDate endDate')
      .populate('approvedBy', 'name')
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Register team for tournament
// @route   POST /api/teams
// @access  Private (Team Manager)
exports.registerTeam = async (req, res) => {
  try {
    const { name, tournament, players, contactEmail, contactPhone, homeCity } = req.body;

    // Check if tournament exists and is open for registration
    const tournamentDoc = await Tournament.findById(tournament);
    if (!tournamentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (!['draft', 'open', 'upcoming'].includes(tournamentDoc.status)) {
      return res.status(400).json({
        success: false,
        message: 'Tournament registration is closed'
      });
    }

    // Check if team name already exists in tournament
    const existingTeam = await Team.findOne({ name, tournament });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists in this tournament'
      });
    }

    // Process players - create Player documents and prepare team players array
    const teamPlayers = [];
    if (players && players.length > 0) {
      for (const playerData of players) {
        // Create or find player
        let player = await Player.findOne({ email: playerData.email?.toLowerCase().trim() });
        
        if (!player) {
          player = await Player.create({
            name: playerData.name?.trim(),
            email: playerData.email?.toLowerCase().trim(),
            age: playerData.age ? parseInt(playerData.age) : undefined,
            gender: playerData.gender,
            phone: playerData.phone?.trim(),
            position: playerData.position,
            experience: playerData.experience
          });
        }

        // Add to team players array
        const teamPlayer = {
          player: player._id,
          isCaptain: false,
          isActive: true
        };
        
        if (playerData.jerseyNumber) {
          teamPlayer.jerseyNumber = parseInt(playerData.jerseyNumber);
        }
        
        teamPlayers.push(teamPlayer);
      }
    }

    const team = await Team.create({
      name,
      tournament,
      manager: req.user.id,
      players: teamPlayers,
      contactEmail,
      contactPhone,
      homeCity
    });

    await team.populate('manager', 'name email');
    await team.populate('players.player', 'name email age gender phone position experience');

    // Create team registration update
    if (req.io) {
      const { createUpdate } = require('./updateController');
      try {
        await createUpdate({
          body: {
            type: 'team_registration',
            title: 'New Team Registration',
            message: `${team.name} has registered for the tournament`,
            priority: 'medium',
            targetAudience: 'officials'
          },
          params: { tournamentId: tournament },
          user: { id: req.user.id },
          io: req.io
        });
      } catch (error) {
        console.error('Error creating team registration update:', error);
      }
    }

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Team registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get teams for tournament
// @route   GET /api/tournaments/:tournamentId/teams
// @access  Public
exports.getTeamsByTournament = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { tournament: req.params.tournamentId };
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('manager', 'name email')
      .populate('players.player', 'name email age gender phone position experience')
      .populate('approvedBy', 'name')
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('manager', 'name email phone')
      .populate('players.player', 'name email age gender phone position experience')
      .populate('tournament', 'title startDate endDate')
      .populate('approvedBy', 'name');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Team Manager or Tournament Director)
exports.updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check authorization
    if (team.manager.toString() !== req.user.id && req.user.role !== 'tournament_director') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this team'
      });
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('manager', 'name email');

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve/Reject team registration
// @route   PUT /api/teams/:id/status
// @access  Private (Tournament Director)
exports.updateTeamStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    team.status = status;
    team.approvedBy = req.user.id;
    team.approvedAt = new Date();

    await team.save();

    // Create team status update
    if (req.io) {
      const { createUpdate } = require('./updateController');
      try {
        await createUpdate({
          body: {
            type: 'team_registration',
            title: `Team ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `${team.name} has been ${status}`,
            priority: status === 'approved' ? 'medium' : 'low',
            targetAudience: status === 'approved' ? 'all' : 'teams',
            metadata: { teamId: team._id }
          },
          params: { tournamentId: team.tournament },
          user: { id: req.user.id },
          io: req.io
        });
      } catch (error) {
        console.error('Error creating team status update:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add player to team
// @route   POST /api/teams/:id/players
// @access  Private (Team Manager)
exports.addPlayerToTeam = async (req, res) => {
  try {
    const { name, email, age, gender, phone, position, experience, jerseyNumber, isCaptain } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Create or find player in separate collection
    let player = await Player.findOne({ email: email.toLowerCase().trim() });
    
    if (!player) {
      const playerData = {
        name: name.trim(),
        email: email.toLowerCase().trim()
      };
      
      if (age && !isNaN(age)) playerData.age = parseInt(age);
      if (gender) playerData.gender = gender;
      if (phone) playerData.phone = phone.trim();
      if (position) playerData.position = position;
      if (experience) playerData.experience = experience;
      
      player = await Player.create(playerData);
    }

    // Check if player already in team
    const existingPlayer = team.players.find(p => p.player && p.player.toString() === player._id.toString());
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Player already in team'
      });
    }

    // Check jersey number uniqueness
    if (jerseyNumber && team.players.find(p => p.jerseyNumber === parseInt(jerseyNumber))) {
      return res.status(400).json({
        success: false,
        message: 'Jersey number already taken'
      });
    }

    // Create player object with required player field
    const playerObj = {
      player: player._id,
      isCaptain: Boolean(isCaptain)
    };
    
    if (jerseyNumber) {
      playerObj.jerseyNumber = parseInt(jerseyNumber);
    }

    // Add player to team using findByIdAndUpdate to avoid validation issues
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $push: { players: playerObj } },
      { new: true, runValidators: true }
    ).populate('players.player', 'name email age gender phone position experience');

    res.status(200).json({
      success: true,
      message: 'Player added successfully',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Add player error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add player'
    });
  }
};

// @desc    Remove player from team
// @route   DELETE /api/teams/:id/players/:playerId
// @access  Private (Team Manager)
exports.removePlayerFromTeam = async (req, res) => {
  try {
    console.log('Remove player - Team ID:', req.params.id, 'Player ID:', req.params.playerId);
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const initialLength = team.players.length;
    team.players = team.players.filter(p => p.player.toString() !== req.params.playerId);
    
    if (team.players.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in team'
      });
    }

    await team.save();
    await team.populate('players.player', 'name email age gender phone position experience');

    // Optional: Delete player from Player collection if not in any other teams
    const otherTeams = await Team.find({ 'players.player': req.params.playerId });
    if (otherTeams.length === 0) {
      await Player.findByIdAndDelete(req.params.playerId);
    }

    res.status(200).json({
      success: true,
      message: 'Player removed successfully',
      data: team
    });
  } catch (error) {
    console.error('Remove player error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};