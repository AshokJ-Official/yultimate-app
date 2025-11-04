const HomeVisit = require('../models/HomeVisit');
const Child = require('../models/Child');

// @desc    Create home visit
// @route   POST /api/home-visits
// @access  Private (Coach, Programme Manager)
exports.createHomeVisit = async (req, res) => {
  try {
    req.body.coach = req.user.id;
    const homeVisit = await HomeVisit.create(req.body);

    await homeVisit.populate('child coach', 'name email');

    // Update child's home visit count
    await updateChildHomeVisitStats(req.body.child);

    res.status(201).json({
      success: true,
      data: homeVisit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get home visits
// @route   GET /api/home-visits
// @access  Private (Coach, Programme Manager)
exports.getHomeVisits = async (req, res) => {
  try {
    const { 
      child, 
      coach, 
      purpose, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};
    
    if (child) query.child = child;
    if (coach) query.coach = coach;
    if (purpose) query.purpose = purpose;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If user is coach, only show their visits
    if (req.user.role === 'coach') {
      query.coach = req.user.id;
    }

    const homeVisits = await HomeVisit.find(query)
      .populate('child', 'name age gender guardianName guardianPhone address')
      .populate('coach', 'name email phone')
      .sort({ visitDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HomeVisit.countDocuments(query);

    res.status(200).json({
      success: true,
      count: homeVisits.length,
      total,
      data: homeVisits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single home visit
// @route   GET /api/home-visits/:id
// @access  Private (Coach, Programme Manager)
exports.getHomeVisit = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id)
      .populate('child', 'name age gender guardianName guardianPhone address school community')
      .populate('coach', 'name email phone');

    if (!homeVisit) {
      return res.status(404).json({
        success: false,
        message: 'Home visit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: homeVisit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update home visit
// @route   PUT /api/home-visits/:id
// @access  Private (Coach, Programme Manager)
exports.updateHomeVisit = async (req, res) => {
  try {
    let homeVisit = await HomeVisit.findById(req.params.id);

    if (!homeVisit) {
      return res.status(404).json({
        success: false,
        message: 'Home visit not found'
      });
    }

    // Check authorization
    if (homeVisit.coach.toString() !== req.user.id && req.user.role !== 'programme_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this home visit'
      });
    }

    homeVisit = await HomeVisit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('child coach', 'name email');

    res.status(200).json({
      success: true,
      data: homeVisit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete home visit
// @route   PUT /api/home-visits/:id/complete
// @access  Private (Coach)
exports.completeHomeVisit = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);

    if (!homeVisit) {
      return res.status(404).json({
        success: false,
        message: 'Home visit not found'
      });
    }

    // Check authorization
    if (homeVisit.coach.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this home visit'
      });
    }

    homeVisit.status = 'completed';
    await homeVisit.save();

    res.status(200).json({
      success: true,
      data: homeVisit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get home visits by child
// @route   GET /api/children/:childId/home-visits
// @access  Private (Coach, Programme Manager)
exports.getHomeVisitsByChild = async (req, res) => {
  try {
    const homeVisits = await HomeVisit.find({ child: req.params.childId })
      .populate('coach', 'name email')
      .sort({ visitDate: -1 });

    // Calculate statistics
    const stats = {
      totalVisits: homeVisits.length,
      completedVisits: homeVisits.filter(v => v.status === 'completed').length,
      pendingVisits: homeVisits.filter(v => v.status === 'planned').length,
      visitsByPurpose: {},
      averageDuration: 0,
      totalTravelTime: 0
    };

    let totalDuration = 0;
    let totalTravelTime = 0;

    homeVisits.forEach(visit => {
      // Count by purpose
      stats.visitsByPurpose[visit.purpose] = (stats.visitsByPurpose[visit.purpose] || 0) + 1;
      
      // Sum durations and travel time
      if (visit.duration) totalDuration += visit.duration;
      if (visit.travelTime) totalTravelTime += visit.travelTime;
    });

    stats.averageDuration = homeVisits.length > 0 ? Math.round(totalDuration / homeVisits.length) : 0;
    stats.totalTravelTime = totalTravelTime;

    res.status(200).json({
      success: true,
      count: homeVisits.length,
      stats,
      data: homeVisits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get home visits by coach
// @route   GET /api/coaches/:coachId/home-visits
// @access  Private (Programme Manager)
exports.getHomeVisitsByCoach = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let query = { coach: req.params.coachId };
    
    if (status) query.status = status;
    if (startDate && endDate) {
      query.visitDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const homeVisits = await HomeVisit.find(query)
      .populate('child', 'name age gender address')
      .sort({ visitDate: -1 });

    // Calculate coach statistics
    const stats = {
      totalVisits: homeVisits.length,
      completedVisits: homeVisits.filter(v => v.status === 'completed').length,
      totalHours: 0,
      totalTravelTime: 0,
      totalTravelDistance: 0,
      visitsByPurpose: {},
      uniqueChildren: new Set(homeVisits.map(v => v.child._id.toString())).size
    };

    homeVisits.forEach(visit => {
      if (visit.duration) stats.totalHours += visit.duration / 60; // Convert to hours
      if (visit.travelTime) stats.totalTravelTime += visit.travelTime;
      if (visit.travelDistance) stats.totalTravelDistance += visit.travelDistance;
      
      stats.visitsByPurpose[visit.purpose] = (stats.visitsByPurpose[visit.purpose] || 0) + 1;
    });

    stats.totalHours = parseFloat(stats.totalHours.toFixed(2));
    stats.totalTravelTime = Math.round(stats.totalTravelTime / 60 * 100) / 100; // Convert to hours
    stats.totalTravelDistance = parseFloat(stats.totalTravelDistance.toFixed(2));

    res.status(200).json({
      success: true,
      count: homeVisits.length,
      stats,
      data: homeVisits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update action item status
// @route   PUT /api/home-visits/:id/action-items/:actionItemId
// @access  Private (Coach, Programme Manager)
exports.updateActionItemStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const homeVisit = await HomeVisit.findById(req.params.id);

    if (!homeVisit) {
      return res.status(404).json({
        success: false,
        message: 'Home visit not found'
      });
    }

    const actionItem = homeVisit.actionItems.id(req.params.actionItemId);

    if (!actionItem) {
      return res.status(404).json({
        success: false,
        message: 'Action item not found'
      });
    }

    actionItem.status = status;
    await homeVisit.save();

    res.status(200).json({
      success: true,
      data: homeVisit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get upcoming home visits
// @route   GET /api/home-visits/upcoming
// @access  Private (Coach, Programme Manager)
exports.getUpcomingHomeVisits = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    let query = {
      visitDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['planned', 'rescheduled'] }
    };

    // If user is coach, only show their visits
    if (req.user.role === 'coach') {
      query.coach = req.user.id;
    }

    const upcomingVisits = await HomeVisit.find(query)
      .populate('child', 'name age guardianName guardianPhone address')
      .populate('coach', 'name email phone')
      .sort({ visitDate: 1 });

    res.status(200).json({
      success: true,
      count: upcomingVisits.length,
      data: upcomingVisits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload photos for home visit
// @route   POST /api/home-visits/:id/photos
// @access  Private (Coach)
exports.uploadHomeVisitPhotos = async (req, res) => {
  try {
    const homeVisit = await HomeVisit.findById(req.params.id);

    if (!homeVisit) {
      return res.status(404).json({
        success: false,
        message: 'Home visit not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    const photos = req.files.map(file => ({
      url: file.path, // Cloudinary URL from multer-storage-cloudinary
      caption: file.originalname
    }));

    homeVisit.photos.push(...photos);
    await homeVisit.save();

    res.status(200).json({
      success: true,
      message: 'Photos uploaded successfully',
      photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to update child's home visit statistics
const updateChildHomeVisitStats = async (childId) => {
  try {
    const homeVisitCount = await HomeVisit.countDocuments({ 
      child: childId, 
      status: 'completed' 
    });

    await Child.findByIdAndUpdate(childId, {
      'stats.homeVisits': homeVisitCount
    });
  } catch (error) {
    console.error('Error updating child home visit stats:', error);
  }
};