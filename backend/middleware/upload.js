const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yultimate/tournaments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create specific upload for home visits
const homeVisitStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yultimate/home-visits',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    resource_type: 'image'
  }
});

const homeVisitUpload = multer({ 
  storage: homeVisitStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = { upload, homeVisitUpload };