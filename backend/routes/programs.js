const express = require('express');
const {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  deleteProgram
} = require('../controllers/programController');
const { protect, authorizeCoaching } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorizeCoaching(), getPrograms)
  .post(protect, authorizeCoaching('programme_director', 'programme_manager'), createProgram);

router.route('/:id')
  .get(protect, authorizeCoaching(), getProgram)
  .put(protect, authorizeCoaching('programme_director', 'programme_manager'), updateProgram)
  .delete(protect, authorizeCoaching('programme_director'), deleteProgram);

module.exports = router;