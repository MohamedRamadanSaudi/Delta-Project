const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Folder in Cloudinary to store uploaded files
    format: async (req, file) => 'png', // Supports promises as well
    public_id: (req, file) => file.originalname.split('.')[0] // File name without extension
  }
});

const upload = multer({ storage: storage });

module.exports = upload;