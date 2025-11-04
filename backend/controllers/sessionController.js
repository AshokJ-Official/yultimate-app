const Session = require('../models/Session');
const Child = require('../models/Child');

// @desc    Create session
// @route   POST /api/sessions
// @access  Private (Coach, Programme Manager)
exports.createSession = async (req, res) => {
  try {
    req.body.coach = req.user.id;
    const session = await Session.create(req.body);

    await session.populate('coach assistantCoaches', 'name email');

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sessions
// @route   GET /api/sessions
// @access  Private (Coach, Programme Manager)
exports.getSessions = async (req, res) => {
  try {
    const { 
      type, 
      location, 
      coach, 
      status, 
      date, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};
    
    if (type) query.type = type;
    if (location) query['location.name'] = new RegExp(location, 'i');
    if (coach) query.coach = coach;
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // If user is coach, only show their sessions
    if (req.user.role === 'coach') {
      query.$or = [
        { coach: req.user.id },
        { assistantCoaches: req.user.id }
      ];
    }

    const sessions = await Session.find(query)
      .populate('coach assistantCoaches', 'name email')
      .populate('attendance.child', 'name age gender')
      .sort({ scheduledDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private (Coach, Programme Manager)
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('coach assistantCoaches', 'name email phone')
      .populate('attendance.child', 'name age gender guardianName guardianPhone')
      .populate('attendance.markedBy', 'name')
      .populate('photos.uploadedBy', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Coach, Programme Manager)
exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    if (session.coach.toString() !== req.user.id && req.user.role !== 'programme_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('coach assistantCoaches', 'name email');

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Start session
// @route   PUT /api/sessions/:id/start
// @access  Private (Coach)
exports.startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const isCoach = session.coach.toString() === req.user.id;
    const isAssistant = session.assistantCoaches.includes(req.user.id);
    const isManager = ['programme_manager', 'programme_director'].includes(req.user.role);
    
    if (!isCoach && !isAssistant && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to start this session'
      });
    }

    session.status = 'in_progress';
    session.actualStartTime = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete session
// @route   PUT /api/sessions/:id/complete
// @access  Private (Coach)
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const isCoach = session.coach.toString() === req.user.id;
    const isAssistant = session.assistantCoaches.includes(req.user.id);
    const isManager = ['programme_manager', 'programme_director'].includes(req.user.role);
    
    if (!isCoach && !isAssistant && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this session'
      });
    }

    session.status = 'completed';
    session.actualEndTime = new Date();

    // Calculate attendance statistics
    const totalChildren = session.attendance.length;
    const presentChildren = session.attendance.filter(att => att.present).length;
    const attendanceRate = totalChildren > 0 ? (presentChildren / totalChildren * 100) : 0;

    session.totalChildren = totalChildren;
    session.presentChildren = presentChildren;
    session.attendanceRate = parseFloat(attendanceRate.toFixed(2));

    await session.save();

    // Update child statistics
    for (const attendance of session.attendance) {
      if (attendance.present) {
        await updateChildStats(attendance.child);
      }
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark attendance
// @route   PUT /api/sessions/:id/attendance
// @access  Private (Coach)
exports.markAttendance = async (req, res) => {
  try {
    const { childId, present, notes } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const isCoach = session.coach.toString() === req.user.id;
    const isAssistant = session.assistantCoaches.includes(req.user.id);
    const isManager = ['programme_manager', 'programme_director'].includes(req.user.role);
    
    if (!isCoach && !isAssistant && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this session'
      });
    }

    // Find existing attendance record
    const existingAttendance = session.attendance.find(
      att => att.child.toString() === childId
    );

    if (existingAttendance) {
      existingAttendance.present = present;
      existingAttendance.markedBy = req.user.id;
      existingAttendance.markedAt = new Date();
      existingAttendance.notes = notes;
    } else {
      session.attendance.push({
        child: childId,
        present,
        markedBy: req.user.id,
        markedAt: new Date(),
        notes
      });
    }

    await session.save();
    await session.populate('attendance.child', 'name age gender');
    await session.populate('attendance.markedBy', 'name');

    // Emit real-time attendance update
    if (req.io) {
      const attendanceData = {
        sessionId: session._id,
        childId,
        present,
        markedBy: req.user.name,
        markedAt: new Date(),
        notes,
        totalPresent: session.attendance.filter(att => att.present).length,
        totalChildren: session.attendance.length
      };
      req.io.to(`session-${session._id}`).emit('attendance-updated', attendanceData);
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk mark attendance
// @route   PUT /api/sessions/:id/bulk-attendance
// @access  Private (Coach)
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of {childId, present, notes}

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const isCoach = session.coach.toString() === req.user.id;
    const isAssistant = session.assistantCoaches.includes(req.user.id);
    const isManager = ['programme_manager', 'programme_director'].includes(req.user.role);
    
    if (!isCoach && !isAssistant && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this session'
      });
    }

    for (const data of attendanceData) {
      const existingAttendance = session.attendance.find(
        att => att.child.toString() === data.childId
      );

      if (existingAttendance) {
        existingAttendance.present = data.present;
        existingAttendance.markedBy = req.user.id;
        existingAttendance.markedAt = new Date();
        existingAttendance.notes = data.notes;
      } else {
        session.attendance.push({
          child: data.childId,
          present: data.present,
          markedBy: req.user.id,
          markedAt: new Date(),
          notes: data.notes
        });
      }
    }

    await session.save();
    await session.populate('attendance.child', 'name age gender');
    await session.populate('attendance.markedBy', 'name');

    // Emit real-time bulk attendance update
    if (req.io) {
      const bulkUpdateData = {
        sessionId: session._id,
        updates: attendanceData,
        markedBy: req.user.name,
        markedAt: new Date(),
        totalPresent: session.attendance.filter(att => att.present).length,
        totalChildren: session.attendance.length
      };
      req.io.to(`session-${session._id}`).emit('bulk-attendance-updated', bulkUpdateData);
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload session photos
// @route   POST /api/sessions/:id/photos
// @access  Private (Coach)
exports.uploadSessionPhotos = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    // Process uploaded files (Cloudinary URLs are in req.files)
    const newPhotos = req.files.map(file => ({
      url: file.path, // Cloudinary URL
      caption: req.body.caption || '',
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    }));

    session.photos = session.photos || [];
    session.photos.push(...newPhotos);
    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      message: `${newPhotos.length} photos uploaded successfully`
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get coach workload
// @route   GET /api/sessions/coach-workload/:coachId
// @access  Private (Programme Manager)
exports.getCoachWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const coachId = req.params.coachId;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await Session.find({
      ...dateQuery,
      $or: [
        { coach: coachId },
        { assistantCoaches: coachId }
      ]
    }).populate('coach assistantCoaches', 'name');

    const workloadData = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      totalHours: 0,
      sessionsByType: {
        school: sessions.filter(s => s.type === 'school').length,
        community: sessions.filter(s => s.type === 'community').length,
        workshop: sessions.filter(s => s.type === 'workshop').length
      },
      sessionsByLocation: {}
    };

    // Calculate total hours and group by location
    sessions.forEach(session => {
      if (session.actualStartTime && session.actualEndTime) {
        const duration = (session.actualEndTime - session.actualStartTime) / (1000 * 60 * 60);
        workloadData.totalHours += duration;
      }

      const location = session.location.name;
      workloadData.sessionsByLocation[location] = (workloadData.sessionsByLocation[location] || 0) + 1;
    });

    workloadData.totalHours = parseFloat(workloadData.totalHours.toFixed(2));

    res.status(200).json({
      success: true,
      data: workloadData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get session children
// @route   GET /api/sessions/:id/children
// @access  Private (Coach, Programme Manager)
exports.getSessionChildren = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('attendance.child', 'name age gender guardianName guardianPhone programme')
      .populate('attendance.markedBy', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Get all registered children for this session
    const registeredChildren = session.attendance.map(att => ({
      child: att.child,
      present: att.present,
      notes: att.notes,
      markedBy: att.markedBy,
      markedAt: att.markedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        session: {
          _id: session._id,
          title: session.title,
          scheduledDate: session.scheduledDate,
          location: session.location,
          status: session.status
        },
        children: registeredChildren,
        stats: {
          total: registeredChildren.length,
          present: registeredChildren.filter(c => c.present).length,
          absent: registeredChildren.filter(c => !c.present).length
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

// @desc    Register child to session
// @route   POST /api/sessions/:id/register-child
// @access  Private (Coach, Programme Manager)
exports.registerChildToSession = async (req, res) => {
  try {
    const { childId } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if child is already registered
    const existingAttendance = session.attendance.find(
      att => att.child.toString() === childId
    );

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Child is already registered for this session'
      });
    }

    // Add child to attendance list
    session.attendance.push({
      child: childId,
      present: false,
      markedBy: req.user.id,
      markedAt: new Date()
    });

    await session.save();
    await session.populate('attendance.child', 'name age gender');

    res.status(200).json({
      success: true,
      data: session,
      message: 'Child registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to update child statistics
const updateChildStats = async (childId) => {
  try {
    const sessions = await Session.find({
      'attendance.child': childId
    });

    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter(session => {
      const attendance = session.attendance.find(att => att.child.toString() === childId);
      return attendance && attendance.present;
    }).length;

    const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions * 100) : 0;

    await Child.findByIdAndUpdate(childId, {
      'stats.totalSessions': totalSessions,
      'stats.attendedSessions': attendedSessions,
      'stats.attendanceRate': parseFloat(attendanceRate.toFixed(2))
    });
  } catch (error) {
    console.error('Error updating child stats:', error);
  }
};