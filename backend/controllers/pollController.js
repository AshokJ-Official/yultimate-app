const Poll = require('../models/Poll');

// Create poll
exports.createPoll = async (req, res) => {
  try {
    const { title, question, options, tournament, expiresAt } = req.body;
    
    const poll = await Poll.create({
      title,
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      tournament,
      createdBy: req.user.id,
      expiresAt
    });

    res.status(201).json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vote on poll
exports.voteOnPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    
    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) {
      return res.status(400).json({ success: false, message: 'Poll not available' });
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ success: false, message: 'Poll has expired' });
    }

    // Check if user already voted
    const existingVote = poll.voters.find(v => v.user.toString() === req.user.id);
    if (existingVote) {
      // Update existing vote
      poll.options[existingVote.option].votes--;
      poll.options[optionIndex].votes++;
      existingVote.option = optionIndex;
      existingVote.votedAt = new Date();
    } else {
      // New vote
      poll.options[optionIndex].votes++;
      poll.voters.push({
        user: req.user.id,
        option: optionIndex
      });
    }

    await poll.save();
    res.json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get polls
exports.getPolls = async (req, res) => {
  try {
    const { tournament } = req.query;
    let query = { isActive: true };
    if (tournament) query.tournament = tournament;

    const polls = await Poll.find(query)
      .populate('createdBy', 'name')
      .populate('tournament', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: polls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get poll details
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId)
      .populate('createdBy', 'name')
      .populate('tournament', 'name');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    const userVote = poll.voters.find(v => v.user.toString() === req.user.id);
    
    res.json({ 
      success: true, 
      data: { 
        ...poll.toObject(), 
        userVote: userVote ? userVote.option : null 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};