const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  followTeam,
  unfollowTeam,
  getFollowedTeams,
  getTeamFollowers,
  updateNotifications,
  checkFollowStatus
} = require('../controllers/followController');

// All routes require authentication
router.use(protect);

router.post('/teams/:teamId', followTeam);
router.delete('/teams/:teamId', unfollowTeam);
router.get('/my-teams', getFollowedTeams);
router.get('/teams/:teamId/followers', getTeamFollowers);
router.put('/teams/:teamId/notifications', updateNotifications);
router.get('/teams/:teamId/status', checkFollowStatus);

module.exports = router;