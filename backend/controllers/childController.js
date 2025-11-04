const Child = require('../models/Child');
const Session = require('../models/Session');
const Assessment = require('../models/Assessment');
const HomeVisit = require('../models/HomeVisit');

// @desc    Register child
// @route   POST /api/children
// @access  Private (Coach, Programme Manager)
exports.registerChild = async (req, res) => {
  try {
    req.body.registeredBy = req.user.id;
    const child = await Child.create(req.body);

    res.status(201).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all children
// @route   GET /api/children
// @access  Private (Coach, Programme Manager)
exports.getChildren = async (req, res) => {
  try {
    const { 
      programme, 
      location, 
      gender, 
      age, 
      isActive = true, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    let query = { isActive };
    
    if (programme) query['programmes.type'] = programme;
    if (location) query['programmes.location'] = new RegExp(location, 'i');
    if (gender) query.gender = gender;
    if (age) {
      const ageRange = age.split('-');
      if (ageRange.length === 2) {
        query.age = { $gte: parseInt(ageRange[0]), $lte: parseInt(ageRange[1]) };
      } else {
        query.age = parseInt(age);
      }
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { guardianName: new RegExp(search, 'i') },
        { 'school.name': new RegExp(search, 'i') },
        { 'community.name': new RegExp(search, 'i') }
      ];
    }

    const children = await Child.find(query)
      .populate('registeredBy', 'name')
      .populate('programmes.coach', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Child.countDocuments(query);

    res.status(200).json({
      success: true,
      count: children.length,
      total,
      data: children
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single child
// @route   GET /api/children/:id
// @access  Private (Coach, Programme Manager)
exports.getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id)
      .populate('registeredBy', 'name email')
      .populate('programmes.coach', 'name email')
      .populate('transferHistory.transferredBy', 'name');

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Get recent sessions, assessments, and home visits
    const recentSessions = await Session.find({
      'attendance.child': req.params.id
    }).populate('coach', 'name').sort({ scheduledDate: -1 }).limit(5);

    const assessments = await Assessment.find({
      child: req.params.id
    }).populate('assessor', 'name').sort({ assessmentDate: -1 });

    const homeVisits = await HomeVisit.find({
      child: req.params.id
    }).populate('coach', 'name').sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        child,
        recentSessions,
        assessments,
        homeVisits
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

// @desc    Update child profile
// @route   PUT /api/children/:id
// @access  Private (Coach, Programme Manager)
exports.updateChild = async (req, res) => {
  try {
    const child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Transfer child between programmes
// @route   POST /api/children/:id/transfer
// @access  Private (Programme Manager)
exports.transferChild = async (req, res) => {
  try {
    console.log('Transfer request body:', req.body);
    const { newProgramme, reason } = req.body;

    if (!newProgramme || !reason) {
      return res.status(400).json({
        success: false,
        message: 'New programme and reason are required'
      });
    }

    const child = await Child.findById(req.params.id);
    console.log('Found child:', child ? child.name : 'Not found');

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const oldProgramme = child.programme || 'No programme';
    console.log('Transferring from:', oldProgramme, 'to:', newProgramme);

    // Initialize transferHistory if it doesn't exist
    if (!child.transferHistory) {
      child.transferHistory = [];
    }

    // Add to transfer history
    child.transferHistory.push({
      fromLocation: oldProgramme,
      toLocation: newProgramme,
      transferDate: new Date(),
      reason,
      transferredBy: req.user.id
    });

    // Update current programme
    child.programme = newProgramme;

    await child.save();
    console.log('Child transferred successfully');

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    console.error('Transfer error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk upload children
// @route   POST /api/children/bulk-upload
// @access  Private (Programme Manager)
exports.bulkUploadChildren = async (req, res) => {
  try {
    const { children } = req.body;

    if (!Array.isArray(children) || children.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of children data'
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const childData of children) {
      try {
        childData.registeredBy = req.user.id;
        const child = await Child.create(childData);
        results.successful.push({
          name: child.name,
          id: child._id
        });
      } catch (error) {
        results.failed.push({
          name: childData.name || 'Unknown',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${results.successful.length} children`,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get child attendance summary
// @route   GET /api/children/:id/attendance
// @access  Private (Coach, Programme Manager)
exports.getChildAttendance = async (req, res) => {
  try {
    const { startDate, endDate, programme } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let sessionQuery = { ...dateQuery };
    if (programme) {
      sessionQuery.type = programme;
    }

    const sessions = await Session.find(sessionQuery)
      .populate('attendance.child', 'name')
      .sort({ scheduledDate: -1 });

    const attendanceData = sessions.map(session => {
      const childAttendance = session.attendance.find(
        att => att.child._id.toString() === req.params.id
      );

      return {
        sessionId: session._id,
        title: session.title,
        date: session.scheduledDate,
        type: session.type,
        location: session.location.name,
        present: childAttendance ? childAttendance.present : false,
        markedAt: childAttendance ? childAttendance.markedAt : null
      };
    });

    const totalSessions = attendanceData.length;
    const attendedSessions = attendanceData.filter(att => att.present).length;
    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSessions,
          attendedSessions,
          attendanceRate: parseFloat(attendanceRate)
        },
        attendance: attendanceData
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

// @desc    Update child statistics
// @route   PUT /api/children/:id/update-stats
// @access  Private (System)
exports.updateChildStats = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Calculate attendance stats
    const sessions = await Session.find({
      'attendance.child': req.params.id
    });

    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter(session => {
      const attendance = session.attendance.find(att => att.child.toString() === req.params.id);
      return attendance && attendance.present;
    }).length;

    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions * 100) : 0;

    // Count home visits and assessments
    const homeVisits = await HomeVisit.countDocuments({ child: req.params.id });
    const assessments = await Assessment.countDocuments({ child: req.params.id });

    // Update child stats
    child.stats = {
      totalSessions,
      attendedSessions,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      homeVisits,
      assessments
    };

    await child.save();

    res.status(200).json({
      success: true,
      data: child
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};