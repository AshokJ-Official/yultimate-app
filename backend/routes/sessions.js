const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  startSession,
  completeSession,
  markAttendance,
  bulkMarkAttendance,
  uploadSessionPhotos,
  getCoachWorkload,
  getSessionChildren,
  registerChildToSession
} = require('../controllers/sessionController');
const { protect, authorizeCoaching } = require('../middleware/auth');
const { validateSession, handleValidationErrors } = require('../middleware/validation');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'session-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.route('/')
  .get(protect, authorizeCoaching(), getSessions)
  .post(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), validateSession, handleValidationErrors, createSession);

router.get('/coach-workload/:coachId', protect, authorizeCoaching('programme_manager'), getCoachWorkload);

router.route('/:id')
  .get(protect, authorizeCoaching(), getSession)
  .put(protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), updateSession);

router.put('/:id/start', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), startSession);
router.put('/:id/complete', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), completeSession);
router.put('/:id/attendance', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), markAttendance);
router.put('/:id/bulk-attendance', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), bulkMarkAttendance);
router.post('/:id/photos', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), upload.array('photos', 10), uploadSessionPhotos);
router.get('/:id/children', protect, authorizeCoaching(), getSessionChildren);
router.post('/:id/register-child', protect, authorizeCoaching('coach', 'programme_manager', 'programme_director'), registerChildToSession);

module.exports = router;