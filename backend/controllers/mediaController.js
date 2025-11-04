const Media = require('../models/Media');
const Tournament = require('../models/Tournament');

// Get media for tournament
exports.getMedia = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { type, category, page = 1, limit = 20 } = req.query;

    const filter = { tournament: tournamentId, isPublic: true };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const media = await Media.find(filter)
      .populate('uploadedBy', 'name')
      .populate('match', 'teamA teamB field')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      data: media,
      pagination: { current: page, pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload media
exports.uploadMedia = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { type, category, title, description, matchId, tags } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const mediaItems = req.files.map(file => ({
      tournament: tournamentId,
      type,
      category,
      url: file.path,
      title: title || file.originalname,
      description,
      uploadedBy: req.user.id,
      match: matchId,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    }));

    const savedMedia = await Media.insertMany(mediaItems);
    await Media.populate(savedMedia, { path: 'uploadedBy', select: 'name' });

    res.status(201).json({ success: true, data: savedMedia });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete media
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Check authorization
    const tournament = await Tournament.findById(media.tournament);
    if (media.uploadedBy.toString() !== req.user.id && 
        tournament.director.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;