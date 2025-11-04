const express = require('express');
const {
  createHomeVisit,
  getHomeVisits,
  getHomeVisit,
  updateHomeVisit,
  completeHomeVisit,
  getHomeVisitsByChild,
  getHomeVisitsByCoach,
  updateActionItemStatus,
  getUpcomingHomeVisits,
  uploadHomeVisitPhotos
} = require('../controllers/homeVisitController');
const { protect, authorizeCoaching } = require('../middleware/auth');
const { homeVisitUpload } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, authorizeCoaching(), getHomeVisits)
  .post(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), createHomeVisit);

router.get('/upcoming', protect, authorizeCoaching(), getUpcomingHomeVisits);
router.get('/children/:childId', protect, authorizeCoaching(), getHomeVisitsByChild);
router.get('/coaches/:coachId', protect, authorizeCoaching('programme_manager'), getHomeVisitsByCoach);

router.route('/:id')
  .get(protect, authorizeCoaching(), getHomeVisit)
  .put(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), updateHomeVisit);

router.put('/:id/complete', protect, authorizeCoaching('coach'), completeHomeVisit);
router.put('/:id/action-items/:actionItemId', protect, authorizeCoaching(), updateActionItemStatus);
router.post('/:id/photos', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), homeVisitUpload.array('photos', 10), uploadHomeVisitPhotos);

module.exports = router;