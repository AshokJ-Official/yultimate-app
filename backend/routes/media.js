const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect, authorize } = require('../middleware/auth');
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yultimate/media',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'],
    resource_type: 'auto'
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get media for tournament
router.get('/tournament/:tournamentId', getMedia);

// Upload media
router.post('/tournament/:tournamentId', 
  protect,
  upload.array('files', 10),
  uploadMedia
);

// Delete media
router.delete('/:id', protect, deleteMedia);

module.exports = router;