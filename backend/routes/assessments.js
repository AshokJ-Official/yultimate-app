const express = require('express');
const {
  createAssessment,
  getAssessments,
  getAssessment,
  updateAssessment,
  completeAssessment,
  getAssessmentsByChild,
  getAssessmentAnalytics,
  getDueAssessments
} = require('../controllers/assessmentController');
const { protect, authorizeCoaching } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorizeCoaching(), getAssessments)
  .post(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), createAssessment);

router.get('/analytics', protect, authorizeCoaching('programme_manager'), getAssessmentAnalytics);
router.get('/due', protect, authorizeCoaching(), getDueAssessments);
router.get('/children/:childId', protect, authorizeCoaching(), getAssessmentsByChild);

router.route('/:id')
  .get(protect, authorizeCoaching(), getAssessment)
  .put(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), updateAssessment);

router.put('/:id/complete', protect, authorizeCoaching('coach'), completeAssessment);

module.exports = router;