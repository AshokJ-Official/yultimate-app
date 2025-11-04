const express = require('express');
const {
  getAllSpiritScores,
  submitSpiritScore,
  getSpiritScoresByMatch,
  getSpiritScoresByTeam,
  getSpiritLeaderboard,
  getPendingSpiritScores,
  canTeamPlayNext,
  getTeamSpiritSummary
} = require('../controllers/spiritController');
const { protect, authorizeTournament } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllSpiritScores);
router.post('/', protect, submitSpiritScore);
router.get('/matches/:matchId', getSpiritScoresByMatch);
router.get('/teams/:teamId', getSpiritScoresByTeam);
router.get('/teams/:teamId/pending', protect, authorizeTournament('team_manager'), getPendingSpiritScores);
router.get('/teams/:teamId/can-play-next', protect, canTeamPlayNext);
router.get('/teams/:teamId/spirit-summary', protect, getTeamSpiritSummary);
router.get('/tournaments/:tournamentId/leaderboard', getSpiritLeaderboard);

module.exports = router;