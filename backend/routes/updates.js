const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUpdates,
  createUpdate,
  deleteUpdate
} = require('../controllers/updateController');

// Get updates for tournament (optional auth for role-based filtering)
router.get('/tournament/:tournamentId', (req, res, next) => {
  // Try to authenticate but don't require it
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      User.findById(decoded.id).then(user => {
        req.user = user;
        next();
      }).catch(() => next());
    } catch (error) {
      next();
    }
  } else {
    next();
  }
}, getUpdates);

// Create update (tournament directors, officials)
router.post('/tournament/:tournamentId', 
  protect, 
  authorize('tournament_director', 'scoring_team', 'volunteer'),
  createUpdate
);

// Delete update
router.delete('/:id', 
  protect,
  deleteUpdate
);

module.exports = router;