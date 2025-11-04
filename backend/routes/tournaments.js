const express = require('express');
const {
  createTournament,
  getTournaments,
  getTournament,
  updateTournament,
  deleteTournament,
  registerVisitor,
  getTournamentDashboard,
  uploadBanner,
  sendRealTimeUpdate,
  getHistoricalData,
  exportTournamentData,
  updateFields,
  getTournamentLeaderboard,
  exportMatchesCSV,
  exportPlayersCSV,
  exportTeamsCSV,
  updateTournamentStatus
} = require('../controllers/tournamentController');
const { protect, authorizeTournament } = require('../middleware/auth');
const { validateTournament, handleValidationErrors } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getTournaments)
  .post(protect, authorizeTournament('tournament_director'), createTournament);

router.route('/:id')
  .get(getTournament)
  .put(protect, authorizeTournament('tournament_director'), updateTournament)
  .delete(protect, authorizeTournament('tournament_director'), deleteTournament);

router.post('/:id/visitors', registerVisitor);
router.get('/:id/dashboard', protect, authorizeTournament(), getTournamentDashboard);
router.post('/:id/banner', protect, authorizeTournament('tournament_director'), upload.single('banner'), uploadBanner);
router.post('/:id/updates', protect, authorizeTournament('tournament_director'), sendRealTimeUpdate);
router.get('/history', getHistoricalData);
router.get('/:id/export', protect, authorizeTournament('tournament_director'), exportTournamentData);
router.get('/:id/export/matches', protect, authorizeTournament('tournament_director'), exportMatchesCSV);
router.get('/:id/export/players', protect, authorizeTournament('tournament_director'), exportPlayersCSV);
router.get('/:id/export/teams', protect, authorizeTournament('tournament_director'), exportTeamsCSV);
router.put('/:id/fields', protect, authorizeTournament('tournament_director'), updateFields);
router.put('/:id/status', protect, authorizeTournament('tournament_director'), updateTournamentStatus);
router.get('/:id/leaderboard', getTournamentLeaderboard);

module.exports = router;