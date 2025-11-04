const express = require('express');
const router = express.Router();

// @desc    Get platform selection page
// @route   GET /api/platform/select
// @access  Public
router.get('/select', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Platform selection',
    platforms: [
      {
        id: 'tournament',
        name: 'Tournament Platform',
        description: 'Manage Ultimate Frisbee tournaments, teams, and matches',
        features: ['Tournament Management', 'Team Registration', 'Live Scoring', 'Spirit Scoring']
      },
      {
        id: 'coaching',
        name: 'Coaching Platform', 
        description: 'Manage coaching programs, sessions, and child development',
        features: ['Session Management', 'Child Profiles', 'Home Visits', 'Assessments']
      }
    ]
  });
});

module.exports = router;