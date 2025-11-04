const express = require('express');
const {
  getTournamentReport,
  getCoachingReport,
  exportTournamentData,
  exportCoachingData,
  exportMatchesData,
  exportAttendanceData,
  exportChildrenData,
  exportSessionsData
} = require('../controllers/reportController');
const { protect, authorizeTournament, authorizeCoaching } = require('../middleware/auth');

const router = express.Router();

router.get('/tournament/:tournamentId', protect, authorizeTournament('tournament_director', 'scoring_team'), getTournamentReport);
router.get('/tournament/:tournamentId/export', protect, authorizeTournament('tournament_director', 'scoring_team'), exportTournamentData);
router.get('/coaching', protect, authorizeCoaching('programme_manager', 'reporting_team'), getCoachingReport);
router.get('/coaching/export', protect, authorizeCoaching('programme_manager', 'reporting_team'), exportCoachingData);
router.get('/attendance/export', protect, exportAttendanceData);
router.get('/children/export', protect, authorizeCoaching('programme_manager', 'programme_director', 'reporting_team'), exportChildrenData);
router.get('/sessions/export', protect, authorizeCoaching('programme_manager', 'programme_director', 'reporting_team'), exportSessionsData);

module.exports = router;