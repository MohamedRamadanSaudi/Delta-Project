const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = req.baseUrl.includes('slider') ? 'slider' : 'products';
    return {
      folder: folder,
      format: 'png', // Supports promises as well
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // Ensure unique public_id
    };
  }
});

const upload = multer({ storage: storage });

module.exports = upload;