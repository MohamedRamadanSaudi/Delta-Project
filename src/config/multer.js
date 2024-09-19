const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const folder = req.baseUrl.includes('slider') ? 'slider' : 'products';
    return {
      folder: folder,
      format: getFormat(file.mimetype),
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // Ensure unique public_id
    };
  }
});

function getFormat(mimetype) {
  const mimetypeToFormat = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi'
  };
  return mimetypeToFormat[mimetype] || 'jpg'; // Default to jpg if mimetype is not recognized
}

const upload = multer({ storage: storage });

module.exports = upload;