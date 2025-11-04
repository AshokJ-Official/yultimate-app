const SocialMedia = require('../models/SocialMedia');

// Get social media links for tournament
exports.getSocialMediaByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { platform, type, isLive } = req.query;

    const filter = { tournament: tournamentId, isActive: true };
    if (platform) filter.platform = platform;
    if (type) filter.type = type;
    if (isLive !== undefined) filter.isLive = isLive === 'true';

    const socialMedia = await SocialMedia.find(filter)
      .populate('createdBy', 'name')
      .sort({ isLive: -1, scheduledTime: -1, createdAt: -1 });

    res.json({
      success: true,
      count: socialMedia.length,
      data: socialMedia
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create social media link
exports.createSocialMedia = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const socialMedia = await SocialMedia.create({
      ...req.body,
      tournament: tournamentId,
      createdBy: req.user.id
    });

    await socialMedia.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: socialMedia
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update social media link
exports.updateSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!socialMedia) {
      return res.status(404).json({ success: false, message: 'Social media link not found' });
    }

    res.json({
      success: true,
      data: socialMedia
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete social media link
exports.deleteSocialMedia = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    
    if (!socialMedia) {
      return res.status(404).json({ success: false, message: 'Social media link not found' });
    }

    socialMedia.isActive = false;
    await socialMedia.save();

    res.json({
      success: true,
      message: 'Social media link deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle live status
exports.toggleLiveStatus = async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);
    
    if (!socialMedia) {
      return res.status(404).json({ success: false, message: 'Social media link not found' });
    }

    socialMedia.isLive = !socialMedia.isLive;
    await socialMedia.save();

    res.json({
      success: true,
      data: socialMedia
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};