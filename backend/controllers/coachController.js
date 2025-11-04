const CoachWorkload = require('../models/CoachWorkload');
const Session = require('../models/Session');
const HomeVisit = require('../models/HomeVisit');
const User = require('../models/User');

// @desc    Get coach workload
// @route   GET /api/coaches/:id/workload
// @access  Private
exports.getCoachWorkload = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const coachId = req.params.id;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get sessions and home visits directly (including assigned ones)
    const sessions = await Session.find({
      $or: [
        { coach: coachId },
        { assistantCoaches: coachId }
      ],
      ...(startDate && endDate ? {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      } : {})
    }).populate('attendance.child', 'name').populate('assignedBy', 'name');

    const homeVisits = await HomeVisit.find({
      coach: coachId,
      ...(startDate && endDate ? {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      } : {})
    }).populate('child', 'name').populate('assignedBy', 'name');

    // Get workload entries (optional - for additional tracking)
    const workload = await CoachWorkload.find({
      coach: coachId,
      ...dateQuery
    })
    .populate('sessions.session', 'title location scheduledDate status')
    .populate('homeVisits.visit', 'child scheduledDate status')
    .sort({ date: -1 });

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      inProgressSessions: sessions.filter(s => s.status === 'in_progress').length,
      totalHomeVisits: homeVisits.length,
      completedVisits: homeVisits.filter(v => v.status === 'completed').length,
      upcomingVisits: homeVisits.filter(v => v.status === 'scheduled').length,
      totalHours: 0,
      totalTravelTime: 0
    };

    // Calculate hours from actual sessions
    sessions.forEach(session => {
      if (session.actualStartTime && session.actualEndTime) {
        const duration = (session.actualEndTime - session.actualStartTime) / (1000 * 60 * 60);
        stats.totalHours += duration;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        workload,
        sessions,
        homeVisits,
        stats
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

// @desc    Update coach session time
// @route   PUT /api/coaches/session-time
// @access  Private
exports.updateSessionTime = async (req, res) => {
  try {
    const { sessionId, startTime, endTime, travelTime, preparationTime } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update session times
    if (startTime) session.actualStartTime = new Date(startTime);
    if (endTime) session.actualEndTime = new Date(endTime);
    
    await session.save();

    // Update or create workload entry
    const date = new Date(session.scheduledDate).toDateString();
    let workload = await CoachWorkload.findOne({
      coach: req.user.id,
      date: new Date(date)
    });

    if (!workload) {
      workload = new CoachWorkload({
        coach: req.user.id,
        date: new Date(date),
        sessions: [],
        homeVisits: []
      });
    }

    // Update session in workload
    const sessionIndex = workload.sessions.findIndex(s => s.session.toString() === sessionId);
    if (sessionIndex >= 0) {
      workload.sessions[sessionIndex] = {
        ...workload.sessions[sessionIndex],
        startTime: startTime ? new Date(startTime) : workload.sessions[sessionIndex].startTime,
        endTime: endTime ? new Date(endTime) : workload.sessions[sessionIndex].endTime,
        travelTime: travelTime || workload.sessions[sessionIndex].travelTime,
        preparationTime: preparationTime || workload.sessions[sessionIndex].preparationTime
      };
    } else {
      workload.sessions.push({
        session: sessionId,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        travelTime: travelTime || 0,
        preparationTime: preparationTime || 0
      });
    }

    await workload.save();

    // Emit real-time update
    if (req.io) {
      req.io.emit('coach-workload-updated', {
        coachId: req.user.id,
        sessionId,
        workload
      });
    }

    res.status(200).json({
      success: true,
      data: { session, workload }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign work to coach
// @route   POST /api/coaches/:id/assign
// @access  Private (Programme Manager)
exports.assignWork = async (req, res) => {
  try {
    const { sessionIds, homeVisitIds, travelTime, notes } = req.body;
    const coachId = req.params.id;

    // Update sessions - assign as main coach if not already assigned
    if (sessionIds && sessionIds.length > 0) {
      for (const sessionId of sessionIds) {
        const session = await Session.findById(sessionId);
        if (session && !session.coach) {
          // If no main coach, assign as main coach
          await Session.findByIdAndUpdate(sessionId, {
            coach: coachId,
            assignedBy: req.user.id,
            assignedAt: new Date()
          });
        } else {
          // Otherwise add as assistant coach
          await Session.findByIdAndUpdate(sessionId, {
            $addToSet: { assistantCoaches: coachId },
            $set: { assignedBy: req.user.id, assignedAt: new Date() }
          });
        }
      }
    }

    // Update home visits
    if (homeVisitIds && homeVisitIds.length > 0) {
      await HomeVisit.updateMany(
        { _id: { $in: homeVisitIds } },
        { coach: coachId, assignedBy: req.user.id, assignedAt: new Date() }
      );
    }

    // Update workload entries for each assigned session/visit date
    const updatedWorkloads = [];
    
    // Process sessions
    if (sessionIds && sessionIds.length > 0) {
      for (const sessionId of sessionIds) {
        const session = await Session.findById(sessionId);
        if (session) {
          const sessionDate = new Date(session.scheduledDate).toDateString();
          let workload = await CoachWorkload.findOne({
            coach: coachId,
            date: new Date(sessionDate)
          });

          if (!workload) {
            workload = new CoachWorkload({
              coach: coachId,
              date: new Date(sessionDate),
              sessions: [],
              homeVisits: []
            });
          }

          if (!workload.sessions.find(s => s.session.toString() === sessionId)) {
            workload.sessions.push({
              session: sessionId,
              travelTime: travelTime || 0,
              status: 'scheduled'
            });
          }

          await workload.save();
          updatedWorkloads.push(workload);
        }
      }
    }

    // Process home visits
    if (homeVisitIds && homeVisitIds.length > 0) {
      for (const visitId of homeVisitIds) {
        const visit = await HomeVisit.findById(visitId);
        if (visit) {
          const visitDate = new Date(visit.scheduledDate).toDateString();
          let workload = await CoachWorkload.findOne({
            coach: coachId,
            date: new Date(visitDate)
          });

          if (!workload) {
            workload = new CoachWorkload({
              coach: coachId,
              date: new Date(visitDate),
              sessions: [],
              homeVisits: []
            });
          }

          if (!workload.homeVisits.find(v => v.visit.toString() === visitId)) {
            workload.homeVisits.push({
              visit: visitId,
              travelTime: travelTime || 0
            });
          }

          await workload.save();
          updatedWorkloads.push(workload);
        }
      }
    }

    // Emit real-time update
    if (req.io) {
      req.io.emit('work-assigned', {
        coachId,
        assignedBy: req.user.name,
        sessionIds,
        homeVisitIds
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work assigned successfully',
      data: updatedWorkloads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all coaches with workload summary
// @route   GET /api/coaches
// @access  Private
exports.getCoaches = async (req, res) => {
  try {
    // If user is a coach, only show their own data
    const query = req.user.role === 'coach' ? { role: 'coach', _id: req.user.id } : { role: 'coach' };
    const coaches = await User.find(query).select('name email phone');
    
    const coachesWithWorkload = await Promise.all(
      coaches.map(async (coach) => {
        // Get all sessions and visits for this coach (not just this week)
        const sessions = await Session.find({
          $or: [
            { coach: coach._id },
            { assistantCoaches: coach._id }
          ]
        });

        const homeVisits = await HomeVisit.find({
          coach: coach._id
        });

        return {
          ...coach.toObject(),
          weeklyStats: {
            sessions: sessions.length,
            homeVisits: homeVisits.length,
            completedSessions: sessions.filter(s => s.status === 'completed').length,
            upcomingSessions: sessions.filter(s => s.status === 'scheduled').length
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: coachesWithWorkload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};