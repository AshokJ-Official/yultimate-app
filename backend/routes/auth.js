const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserRegistration, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

module.exports = router;