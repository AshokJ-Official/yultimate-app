const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');
const {
  generateRoundRobinSchedule,
  generateBracketSchedule,
  generateSwissSchedule,
  optimizeSchedule
} = require('../utils/scheduleGenerator');

// @desc    Generate tournament schedule
// @route   POST /api/tournaments/:id/generate-schedule
// @access  Private (Tournament Director)
exports.generateSchedule = async (req, res) => {
  try {
    const { type, startDate, matchDuration = 90, numRounds } = req.body;
    
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const teams = await Team.find({ 
      tournament: req.params.id, 
      status: 'approved' 
    });

    if (teams.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 approved teams required to generate schedule'
      });
    }

    let matches = [];
    
    switch (type) {
      case 'round_robin':
        matches = generateRoundRobinSchedule(teams, tournament.fields, startDate, matchDuration);
        break;
      case 'bracket':
        matches = generateBracketSchedule(teams, tournament.fields, startDate, matchDuration);
        break;
      case 'swiss':
        matches = generateSwissSchedule(teams, tournament.fields, startDate, numRounds || 5, matchDuration);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid schedule type'
        });
    }

    // Optimize schedule for field usage
    matches = optimizeSchedule(matches, tournament.fields);

    // Add tournament reference to all matches
    matches = matches.map(match => ({
      ...match,
      tournament: req.params.id
    }));

    res.status(200).json({
      success: true,
      data: {
        matches,
        summary: {
          totalMatches: matches.length,
          totalRounds: [...new Set(matches.map(m => m.round))].length,
          fieldsUsed: [...new Set(matches.map(m => m.field))].length
        }
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

// @desc    Save generated schedule
// @route   POST /api/tournaments/:id/save-schedule
// @access  Private (Tournament Director)
exports.saveSchedule = async (req, res) => {
  try {
    const { matches } = req.body;
    
    // Delete existing matches for this tournament
    await Match.deleteMany({ tournament: req.params.id });
    
    // Create new matches
    const createdMatches = await Match.insertMany(matches);
    
    res.status(201).json({
      success: true,
      message: 'Schedule saved successfully',
      data: createdMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get field-wise schedule
// @route   GET /api/tournaments/:id/field-schedule
// @access  Public
exports.getFieldSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = { tournament: req.params.id };
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const matches = await Match.find(query)
      .populate('teamA teamB', 'name')
      .sort({ scheduledTime: 1 });

    // Group matches by field
    const fieldSchedule = {};
    matches.forEach(match => {
      if (!fieldSchedule[match.field]) {
        fieldSchedule[match.field] = [];
      }
      fieldSchedule[match.field].push(match);
    });

    res.status(200).json({
      success: true,
      data: fieldSchedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};