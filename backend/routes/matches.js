const express = require('express');
const {
  createMatch,
  getAllMatches,
  getMatchesByTournament,
  getMatch,
  updateMatchScore,
  completeMatch,
  markAttendance,
  uploadMatchPhotos,
  getLiveMatches
} = require('../controllers/matchController');
const { exportMatchesData } = require('../controllers/reportController');
const { protect, authorizeTournament } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.get('/', getAllMatches);
router.get('/export', protect, exportMatchesData);
router.post('/', protect, authorizeTournament('tournament_director'), createMatch);
router.get('/live', getLiveMatches);
router.get('/tournament/:tournamentId', getMatchesByTournament);
router.get('/:id', getMatch);
router.put('/:id/score', protect, authorizeTournament('tournament_director', 'volunteer', 'scoring_team'), updateMatchScore);
router.put('/:id/complete', protect, authorizeTournament('tournament_director', 'volunteer', 'scoring_team'), completeMatch);
router.put('/:id/attendance', protect, authorizeTournament('volunteer', 'team_manager'), markAttendance);
router.post('/:id/photos', protect, authorizeTournament('tournament_director', 'team_manager', 'volunteer'), upload.array('photos', 10), uploadMatchPhotos);

module.exports = router;