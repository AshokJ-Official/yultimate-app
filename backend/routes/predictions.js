const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPrediction,
  getUserPredictions,
  getMatchPredictions,
  getLeaderboard
} = require('../controllers/predictionController');

router.use(protect);

router.post('/', createPrediction);
router.get('/my-predictions', getUserPredictions);
router.get('/match/:matchId', getMatchPredictions);
router.get('/leaderboard', getLeaderboard);

module.exports = router;