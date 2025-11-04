const express = require('express');
const {
  getCoaches,
  getCoachWorkload,
  updateSessionTime,
  assignWork
} = require('../controllers/coachController');
const { protect, authorizeCoaching } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorizeCoaching('programme_manager', 'programme_director', 'coach'), getCoaches);
router.get('/:id/workload', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), getCoachWorkload);
router.put('/session-time', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), updateSessionTime);
router.post('/:id/assign', protect, authorizeCoaching('programme_manager', 'programme_director'), assignWork);

module.exports = router;