const express = require('express');
const {
  generateSchedule,
  saveSchedule,
  getFieldSchedule
} = require('../controllers/scheduleController');
const { protect, authorizeTournament } = require('../middleware/auth');

const router = express.Router();

router.post('/tournaments/:id/generate-schedule', protect, authorizeTournament('tournament_director', 'team_manager'), generateSchedule);
router.post('/tournaments/:id/save-schedule', protect, authorizeTournament('tournament_director', 'team_manager'), saveSchedule);
router.get('/tournaments/:id/field-schedule', getFieldSchedule);

module.exports = router;