const express = require('express');
const {
  registerTeam,
  getAllTeams,
  getTeamsByTournament,
  getTeam,
  updateTeam,
  updateTeamStatus,
  addPlayerToTeam,
  removePlayerFromTeam
} = require('../controllers/teamController');
const { protect, authorizeTournament } = require('../middleware/auth');
const { validateTeam, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/', getAllTeams);
router.post('/', protect, authorizeTournament('team_manager'), validateTeam, handleValidationErrors, registerTeam);
router.get('/tournament/:tournamentId', getTeamsByTournament);
router.get('/:id', getTeam);
router.put('/:id', protect, authorizeTournament(), updateTeam);
router.put('/:id/status', protect, authorizeTournament('tournament_director'), updateTeamStatus);
router.post('/:id/players', protect, addPlayerToTeam);
router.delete('/:id/players/:playerId', protect, removePlayerFromTeam);

module.exports = router;