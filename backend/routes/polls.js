const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPoll,
  voteOnPoll,
  getPolls,
  getPoll
} = require('../controllers/pollController');

router.use(protect);

router.post('/', createPoll);
router.get('/', getPolls);
router.get('/:pollId', getPoll);
router.post('/:pollId/vote', voteOnPoll);

module.exports = router;