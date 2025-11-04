const Follow = require('../models/Follow');
const Team = require('../models/Team');
const User = require('../models/User');

// Follow a team
exports.followTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const fanId = req.user.id;

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ fan: fanId, team: teamId });
    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following this team' });
    }

    const follow = await Follow.create({
      fan: fanId,
      team: teamId,
      notifications: req.body.notifications || {}
    });

    await follow.populate('team', 'name logo');
    
    res.status(201).json({
      success: true,
      data: follow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unfollow a team
exports.unfollowTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const fanId = req.user.id;

    const follow = await Follow.findOneAndDelete({ fan: fanId, team: teamId });
    if (!follow) {
      return res.status(404).json({ success: false, message: 'Not following this team' });
    }

    res.json({ success: true, message: 'Unfollowed team successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's followed teams
exports.getFollowedTeams = async (req, res) => {
  try {
    const follows = await Follow.find({ fan: req.user.id })
      .populate('team', 'name logo tournament stats')
      .populate('team.tournament', 'name status')
      .sort({ followedAt: -1 });

    res.json({
      success: true,
      count: follows.length,
      data: follows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get team followers
exports.getTeamFollowers = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const followers = await Follow.find({ team: teamId })
      .populate('fan', 'name email')
      .sort({ followedAt: -1 });

    res.json({
      success: true,
      count: followers.length,
      data: followers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update notification preferences
exports.updateNotifications = async (req, res) => {
  try {
    const { teamId } = req.params;
    const fanId = req.user.id;

    const follow = await Follow.findOneAndUpdate(
      { fan: fanId, team: teamId },
      { notifications: req.body.notifications },
      { new: true }
    ).populate('team', 'name logo');

    if (!follow) {
      return res.status(404).json({ success: false, message: 'Not following this team' });
    }

    res.json({ success: true, data: follow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user follows team
exports.checkFollowStatus = async (req, res) => {
  try {
    const { teamId } = req.params;
    const fanId = req.user.id;

    const follow = await Follow.findOne({ fan: fanId, team: teamId });
    
    res.json({
      success: true,
      isFollowing: !!follow,
      data: follow
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};