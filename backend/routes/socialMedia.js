const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSocialMediaByTournament,
  createSocialMedia,
  updateSocialMedia,
  deleteSocialMedia,
  toggleLiveStatus
} = require('../controllers/socialMediaController');

// Get social media links for tournament
router.get('/tournament/:tournamentId', getSocialMediaByTournament);

// Create social media link
router.post('/tournament/:tournamentId', 
  protect, 
  authorize('tournament_director', 'volunteer'),
  createSocialMedia
);

// Update social media link
router.put('/:id', 
  protect,
  authorize('tournament_director', 'volunteer'),
  updateSocialMedia
);

// Delete social media link
router.delete('/:id', 
  protect,
  authorize('tournament_director', 'volunteer'),
  deleteSocialMedia
);

// Toggle live status
router.patch('/:id/live', 
  protect,
  authorize('tournament_director', 'volunteer'),
  toggleLiveStatus
);

module.exports = router;