const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Child = require('../models/Child');
const Session = require('../models/Session');
const Assessment = require('../models/Assessment');
const HomeVisit = require('../models/HomeVisit');

// @desc    Get tournament report
// @route   GET /api/reports/tournament/:tournamentId
// @access  Private (Tournament Director, Scoring Team)
exports.getTournamentReport = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId)
      .populate('director', 'name email');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const teams = await Team.find({ tournament: req.params.tournamentId })
      .populate('manager', 'name email')
      .populate('players.player', 'user age gender');

    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('teamA teamB', 'name');

    // Calculate statistics
    const report = {
      tournament: {
        id: tournament._id,
        title: tournament.title,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        location: tournament.location,
        status: tournament.status,
        director: tournament.director
      },
      statistics: {
        totalTeams: teams.length,
        approvedTeams: teams.filter(t => t.status === 'approved').length,
        totalPlayers: teams.reduce((acc, team) => acc + team.players.length, 0),
        totalMatches: matches.length,
        completedMatches: matches.filter(m => m.status === 'completed').length,
        totalVisitors: tournament.visitors.length
      },
      demographics: {
        playersByGender: {},
        playersByAge: {},
        teamsByStatus: {}
      },
      performance: {
        topTeams: [],
        spiritLeaders: [],
        matchResults: []
      }
    };

    // Demographics analysis
    let totalMale = 0, totalFemale = 0, totalOther = 0;
    const ageGroups = { '10-15': 0, '16-20': 0, '21-25': 0, '26+': 0 };

    teams.forEach(team => {
      report.demographics.teamsByStatus[team.status] = (report.demographics.teamsByStatus[team.status] || 0) + 1;
      
      team.players.forEach(playerRef => {
        if (playerRef.player) {
          const gender = playerRef.player.gender;
          const age = playerRef.player.age;
          
          if (gender === 'male') totalMale++;
          else if (gender === 'female') totalFemale++;
          else totalOther++;
          
          if (age <= 15) ageGroups['10-15']++;
          else if (age <= 20) ageGroups['16-20']++;
          else if (age <= 25) ageGroups['21-25']++;
          else ageGroups['26+']++;
        }
      });
    });

    report.demographics.playersByGender = { male: totalMale, female: totalFemale, other: totalOther };
    report.demographics.playersByAge = ageGroups;

    // Performance analysis
    const approvedTeams = teams.filter(t => t.status === 'approved');
    
    // Top teams by wins
    report.performance.topTeams = approvedTeams
      .sort((a, b) => b.stats.wins - a.stats.wins)
      .slice(0, 5)
      .map(team => ({
        name: team.name,
        wins: team.stats.wins,
        losses: team.stats.losses,
        draws: team.stats.draws,
        pointsFor: team.stats.pointsFor,
        pointsAgainst: team.stats.pointsAgainst
      }));

    // Spirit leaders
    report.performance.spiritLeaders = approvedTeams
      .filter(t => t.stats.averageSpiritScore > 0)
      .sort((a, b) => b.stats.averageSpiritScore - a.stats.averageSpiritScore)
      .slice(0, 5)
      .map(team => ({
        name: team.name,
        averageSpiritScore: team.stats.averageSpiritScore,
        gamesPlayed: team.stats.gamesPlayed
      }));

    // Recent match results
    report.performance.matchResults = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => b.actualEndTime - a.actualEndTime)
      .slice(0, 10)
      .map(match => ({
        teamA: match.teamA.name,
        teamB: match.teamB.name,
        scoreA: match.score.teamA,
        scoreB: match.score.teamB,
        winner: match.winner ? (match.winner.toString() === match.teamA._id.toString() ? match.teamA.name : match.teamB.name) : 'Draw',
        date: match.actualEndTime
      }));

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get coaching programme report
// @route   GET /api/reports/coaching
// @access  Private (Programme Manager, Reporting Team)
exports.getCoachingReport = async (req, res) => {
  try {
    const { startDate, endDate, programme, location } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build queries
    let childQuery = { isActive: true };
    let sessionQuery = {};
    
    if (programme) {
      childQuery['programmes.type'] = programme;
      sessionQuery.type = programme;
    }
    
    if (location) {
      childQuery['programmes.location'] = new RegExp(location, 'i');
      sessionQuery['location.name'] = new RegExp(location, 'i');
    }

    if (Object.keys(dateQuery).length > 0) {
      sessionQuery.scheduledDate = dateQuery;
    }

    // Fetch data
    const children = await Child.find(childQuery);
    const sessions = await Session.find(sessionQuery).populate('coach', 'name');
    const assessments = await Assessment.find({
      ...(Object.keys(dateQuery).length > 0 && { assessmentDate: dateQuery }),
      ...(programme && { programme })
    });
    const homeVisits = await HomeVisit.find({
      ...(Object.keys(dateQuery).length > 0 && { visitDate: dateQuery })
    });

    const report = {
      summary: {
        totalChildren: children.length,
        activeChildren: children.filter(c => c.isActive).length,
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        totalAssessments: assessments.length,
        totalHomeVisits: homeVisits.length
      },
      demographics: {
        childrenByGender: { male: 0, female: 0, other: 0 },
        childrenByAge: { '5-8': 0, '9-12': 0, '13-15': 0, '16+': 0 },
        childrenByProgramme: { school: 0, community: 0, workshop: 0 }
      },
      participation: {
        averageAttendanceRate: 0,
        sessionsByType: { school: 0, community: 0, workshop: 0 },
        sessionsByLocation: {},
        topAttendees: [],
        attendanceTrends: []
      },
      assessments: {
        assessmentsByType: { baseline: 0, midline: 0, endline: 0, follow_up: 0 },
        averageScores: {
          communication: 0,
          teamwork: 0,
          leadership: 0,
          problemSolving: 0,
          selfConfidence: 0,
          emotionalRegulation: 0,
          socialSkills: 0,
          resilience: 0
        },
        improvementTrends: []
      },
      coaching: {
        coachWorkload: {},
        homeVisitsByPurpose: {},
        totalCoachingHours: 0
      }
    };

    // Demographics analysis
    children.forEach(child => {
      report.demographics.childrenByGender[child.gender]++;
      
      const ageGroup = child.age <= 8 ? '5-8' : child.age <= 12 ? '9-12' : child.age <= 15 ? '13-15' : '16+';
      report.demographics.childrenByAge[ageGroup]++;
      
      child.programmes.forEach(prog => {
        if (prog.isActive) {
          report.demographics.childrenByProgramme[prog.type]++;
        }
      });
    });

    // Participation analysis
    let totalAttendanceRate = 0;
    let childrenWithAttendance = 0;

    children.forEach(child => {
      if (child.stats.attendanceRate > 0) {
        totalAttendanceRate += child.stats.attendanceRate;
        childrenWithAttendance++;
      }
    });

    report.participation.averageAttendanceRate = childrenWithAttendance > 0 
      ? parseFloat((totalAttendanceRate / childrenWithAttendance).toFixed(2)) 
      : 0;

    sessions.forEach(session => {
      report.participation.sessionsByType[session.type]++;
      report.participation.sessionsByLocation[session.location.name] = 
        (report.participation.sessionsByLocation[session.location.name] || 0) + 1;
    });

    // Top attendees
    report.participation.topAttendees = children
      .filter(c => c.stats.attendanceRate > 0)
      .sort((a, b) => b.stats.attendanceRate - a.stats.attendanceRate)
      .slice(0, 10)
      .map(child => ({
        name: child.name,
        attendanceRate: child.stats.attendanceRate,
        totalSessions: child.stats.totalSessions,
        attendedSessions: child.stats.attendedSessions
      }));

    // Assessment analysis
    assessments.forEach(assessment => {
      report.assessments.assessmentsByType[assessment.type]++;
    });

    if (assessments.length > 0) {
      const skillTotals = {
        communication: 0, teamwork: 0, leadership: 0, problemSolving: 0,
        selfConfidence: 0, emotionalRegulation: 0, socialSkills: 0, resilience: 0
      };

      assessments.forEach(assessment => {
        Object.keys(skillTotals).forEach(skill => {
          if (assessment.lsasScores[skill] && assessment.lsasScores[skill].score) {
            skillTotals[skill] += assessment.lsasScores[skill].score;
          }
        });
      });

      Object.keys(skillTotals).forEach(skill => {
        report.assessments.averageScores[skill] = parseFloat((skillTotals[skill] / assessments.length).toFixed(2));
      });
    }

    // Coaching analysis
    const coachSessions = {};
    let totalHours = 0;

    sessions.forEach(session => {
      const coachName = session.coach.name;
      if (!coachSessions[coachName]) {
        coachSessions[coachName] = { sessions: 0, hours: 0 };
      }
      coachSessions[coachName].sessions++;
      
      if (session.actualStartTime && session.actualEndTime) {
        const hours = (session.actualEndTime - session.actualStartTime) / (1000 * 60 * 60);
        coachSessions[coachName].hours += hours;
        totalHours += hours;
      }
    });

    report.coaching.coachWorkload = coachSessions;
    report.coaching.totalCoachingHours = parseFloat(totalHours.toFixed(2));

    homeVisits.forEach(visit => {
      report.coaching.homeVisitsByPurpose[visit.purpose] = 
        (report.coaching.homeVisitsByPurpose[visit.purpose] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export tournament data
// @route   GET /api/reports/tournament/:tournamentId/export
// @access  Private (Tournament Director, Scoring Team)
exports.exportTournamentData = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const tournament = await Tournament.findById(req.params.tournamentId);
    const teams = await Team.find({ tournament: req.params.tournamentId })
      .populate('manager players.player');
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('teamA teamB');

    const exportData = {
      tournament,
      teams,
      matches,
      exportedAt: new Date(),
      exportedBy: req.user.id
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=tournament-${tournament.title}-${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tournament-${tournament.title}-${Date.now()}.json`);
    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export coaching data
// @route   GET /api/reports/coaching/export
// @access  Private (Programme Manager, Reporting Team)
exports.exportCoachingData = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, programme } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (programme) {
      query['programmes.type'] = programme;
    }

    const children = await Child.find(query);
    const sessions = await Session.find({
      ...(startDate && endDate && {
        scheduledDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }),
      ...(programme && { type: programme })
    }).populate('coach attendance.child');

    const assessments = await Assessment.find({
      ...(startDate && endDate && {
        assessmentDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }),
      ...(programme && { programme })
    }).populate('child assessor');

    const exportData = {
      children,
      sessions,
      assessments,
      exportedAt: new Date(),
      exportedBy: req.user.id
    };

    if (format === 'csv') {
      const csvData = convertCoachingToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=coaching-data-${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=coaching-data-${Date.now()}.json`);
    res.status(200).json(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to convert tournament data to CSV
const convertToCSV = (data) => {
  const { teams, matches } = data;
  
  let csv = 'Team Name,Manager,Players Count,Status,Wins,Losses,Points For,Points Against,Spirit Score\n';
  
  teams.forEach(team => {
    csv += `"${team.name}","${team.manager.name}",${team.players.length},"${team.status}",${team.stats.wins},${team.stats.losses},${team.stats.pointsFor},${team.stats.pointsAgainst},${team.stats.averageSpiritScore}\n`;
  });
  
  csv += '\n\nMatch Results\n';
  csv += 'Team A,Team B,Score A,Score B,Status,Date\n';
  
  matches.forEach(match => {
    csv += `"${match.teamA.name}","${match.teamB.name}",${match.score.teamA},${match.score.teamB},"${match.status}","${match.scheduledTime}"\n`;
  });
  
  return csv;
};

// @desc    Export matches data
// @route   GET /api/matches/export
// @access  Private
exports.exportMatchesData = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const matches = await Match.find({})
      .populate('teamA teamB', 'name')
      .populate('tournament', 'title');

    if (format === 'csv') {
      let csv = 'Tournament,Team A,Team B,Score A,Score B,Status,Scheduled Time,Actual Start,Actual End,Field\n';
      
      matches.forEach(match => {
        csv += `"${match.tournament?.title || 'N/A'}","${match.teamA?.name || 'Team A'}","${match.teamB?.name || 'Team B'}",${match.score?.teamA || 0},${match.score?.teamB || 0},"${match.status}","${match.scheduledTime}","${match.actualStartTime || ''}","${match.actualEndTime || ''}","${match.field || ''}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=matches-export-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export attendance data
// @route   GET /api/reports/attendance/export
// @access  Private
exports.exportAttendanceData = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    const teams = await Team.find({})
      .populate('players.player', 'name age gender email')
      .populate('tournament', 'title');

    if (format === 'csv') {
      let csv = 'Tournament,Team,Player Name,Age,Gender,Email,Position,Experience,Status\n';
      
      teams.forEach(team => {
        team.players.forEach(playerRef => {
          const player = playerRef.player;
          if (player) {
            csv += `"${team.tournament?.title || 'N/A'}","${team.name}","${player.name || 'N/A'}",${player.age || 'N/A'},"${player.gender || 'N/A'}","${player.email || 'N/A'}","${playerRef.position || 'N/A'}","${playerRef.experience || 'N/A'}","${playerRef.status || 'active'}"\n`;
          }
        });
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-export-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export children data
// @route   GET /api/reports/children/export
// @access  Private
exports.exportChildrenData = async (req, res) => {
  try {
    const { format = 'csv', programme, active = 'true' } = req.query;
    
    let query = {};
    if (programme) query['programmes.type'] = programme;
    if (active === 'true') query.isActive = true;
    
    const children = await Child.find(query);
    
    if (format === 'csv') {
      let csv = 'Name,Age,Gender,Guardian Name,Guardian Phone,Guardian Email,Address,School,Community,Programme,Registration Date,Attendance Rate,Total Sessions,Attended Sessions,Home Visits,Assessments,Status\n';
      
      children.forEach(child => {
        const programme = child.programmes.find(p => p.isActive)?.type || 'N/A';
        const school = child.school?.name || 'N/A';
        const community = child.community?.name || 'N/A';
        
        csv += `"${child.name}",${child.age},"${child.gender}","${child.guardianName}","${child.guardianPhone}","${child.guardianEmail || 'N/A'}","${child.address}","${school}","${community}","${programme}","${child.createdAt}",${child.stats.attendanceRate || 0},${child.stats.totalSessions || 0},${child.stats.attendedSessions || 0},${child.stats.homeVisits || 0},${child.stats.assessments || 0},"${child.isActive ? 'Active' : 'Inactive'}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=children-export-${Date.now()}.csv`);
      return res.send(csv);
    }
    
    res.json({ success: true, data: children });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export sessions data
// @route   GET /api/reports/sessions/export
// @access  Private
exports.exportSessionsData = async (req, res) => {
  try {
    const { format = 'csv', programme, startDate, endDate, coach } = req.query;
    
    let query = {};
    if (programme) query.type = programme;
    if (coach) query.coach = coach;
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sessions = await Session.find(query)
      .populate('coach', 'name email')
      .populate('attendance.child', 'name age gender');
    
    if (format === 'csv') {
      let csv = 'Session Title,Type,Date,Start Time,End Time,Duration,Location,Coach,Status,Total Children,Present,Absent,Attendance Rate,Activities,Notes\n';
      
      sessions.forEach(session => {
        const totalChildren = session.attendance.length;
        const presentCount = session.attendance.filter(a => a.present).length;
        const absentCount = totalChildren - presentCount;
        const attendanceRate = totalChildren > 0 ? ((presentCount / totalChildren) * 100).toFixed(1) : 0;
        
        csv += `"${session.title}","${session.type}","${session.scheduledDate}","${session.scheduledStartTime || 'N/A'}","${session.scheduledEndTime || 'N/A'}","${session.duration || 'N/A'}","${session.location?.name || 'N/A'}","${session.coach?.name || 'N/A'}","${session.status}",${totalChildren},${presentCount},${absentCount},${attendanceRate}%,"${session.activities?.join(', ') || 'N/A'}","${session.notes || 'N/A'}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sessions-export-${Date.now()}.csv`);
      return res.send(csv);
    }
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to convert coaching data to CSV
const convertCoachingToCSV = (data) => {
  const { children, sessions } = data;
  
  let csv = 'Child Name,Age,Gender,Guardian,Phone,Programme,Attendance Rate,Total Sessions,Attended Sessions\n';
  
  children.forEach(child => {
    const programme = child.programmes.find(p => p.isActive)?.type || 'N/A';
    csv += `"${child.name}",${child.age},"${child.gender}","${child.guardianName}","${child.guardianPhone}","${programme}",${child.stats.attendanceRate},${child.stats.totalSessions},${child.stats.attendedSessions}\n`;
  });
  
  return csv;
};