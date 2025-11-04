const Update = require('../models/Update');
const Tournament = require('../models/Tournament');

// Get live updates for a tournament
exports.getUpdates = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { page = 1, limit = 20, type, priority } = req.query;

    const filter = { tournament: tournamentId, isActive: true };
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    // Filter by target audience based on user role
    if (req.user) {
      const userRole = req.user.role;
      const roleToAudienceMap = {
        'team_manager': 'teams',
        'player': 'players', 
        'volunteer': 'officials',
        'scoring_team': 'officials',
        'sponsor': 'spectators',
        'spectator': 'spectators'
      };
      
      const userAudience = roleToAudienceMap[userRole];
      if (userAudience) {
        filter.$or = [
          { targetAudience: 'all' },
          { targetAudience: userAudience }
        ];
      }
    } else {
      // Non-authenticated users only see public updates
      filter.targetAudience = { $in: ['all', 'spectators'] };
    }

    const updates = await Update.find(filter)
      .populate('author', 'name role')
      .populate('metadata.matchId', 'team1 team2 field')
      .populate('metadata.teamId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Update.countDocuments(filter);

    res.json({
      success: true,
      data: updates,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new update
exports.createUpdate = async (req, res) => {
  try {
    const { type, title, message, priority, targetAudience, metadata } = req.body;
    const { tournamentId } = req.params;

    const update = await Update.create({
      type,
      title,
      message,
      tournament: tournamentId,
      author: req.user.id,
      priority,
      targetAudience,
      metadata
    });

    await update.populate('author', 'name role');

    // Emit to tournament room
    req.io.to(`tournament-${tournamentId}`).emit('new-update', update);

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Auto-create updates for match events
exports.createMatchUpdate = async (matchId, type, data, io) => {
  try {
    const Match = require('../models/Match');
    const match = await Match.findById(matchId).populate('tournament team1 team2');
    
    if (!match) return;

    let title, message;
    
    switch (type) {
      case 'match_start':
        title = 'Match Started';
        message = `${match.team1.name} vs ${match.team2.name} has begun on ${match.field}`;
        break;
      case 'match_end':
        title = 'Match Completed';
        message = `${match.team1.name} ${data.score.team1} - ${data.score.team2} ${match.team2.name}`;
        break;
      case 'score_update':
        title = 'Score Update';
        message = `${match.team1.name} ${data.score.team1} - ${data.score.team2} ${match.team2.name}`;
        break;
    }

    const update = await Update.create({
      type,
      title,
      message,
      tournament: match.tournament._id,
      author: data.userId,
      priority: type === 'match_end' ? 'high' : 'medium',
      targetAudience: data.targetAudience || 'all',
      metadata: {
        matchId,
        score: data.score
      }
    });

    await update.populate('author', 'name role');
    
    io.to(`tournament-${match.tournament._id}`).emit('new-update', update);
    
    return update;
  } catch (error) {
    console.error('Error creating match update:', error);
  }
};

// Delete update
exports.deleteUpdate = async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    
    if (!update) {
      return res.status(404).json({ success: false, message: 'Update not found' });
    }

    // Check if user is author or tournament director
    const tournament = await Tournament.findById(update.tournament);
    if (update.author.toString() !== req.user.id && 
        tournament.director.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    update.isActive = false;
    await update.save();

    req.io.to(`tournament-${update.tournament}`).emit('update-deleted', update._id);

    res.json({ success: true, message: 'Update deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;