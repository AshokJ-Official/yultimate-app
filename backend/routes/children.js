const express = require('express');
const {
  registerChild,
  getChildren,
  getChild,
  updateChild,
  transferChild,
  bulkUploadChildren,
  getChildAttendance,
  updateChildStats
} = require('../controllers/childController');
const { protect, authorizeCoaching } = require('../middleware/auth');
const { validateChild, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(protect, authorizeCoaching(), getChildren)
  .post(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), validateChild, handleValidationErrors, registerChild);

router.post('/bulk-upload', protect, authorizeCoaching('programme_manager', 'programme_director'), bulkUploadChildren);

router.route('/:id')
  .get(protect, authorizeCoaching(), getChild)
  .put(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), updateChild);

router.post('/:id/transfer', protect, authorizeCoaching('programme_manager', 'programme_director'), transferChild);
router.get('/:id/attendance', protect, authorizeCoaching(), getChildAttendance);
router.put('/:id/update-stats', protect, authorizeCoaching(), updateChildStats);

module.exports = router;