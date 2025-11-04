const express = require('express');
const {
  registerCoaching,
  loginCoaching
} = require('../controllers/coachingAuthController');
const { validateUserRegistration, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateUserRegistration, handleValidationErrors, registerCoaching);
router.post('/login', loginCoaching);

module.exports = router;