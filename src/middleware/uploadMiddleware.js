const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('./apiMiddleware');

// Gunakan direktori temporary sistem
const uploadDir = '/tmp';

// Pastikan direktori temporary ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware untuk menangani upload
const handleUpload = upload.single('image');

// Fungsi untuk menghapus file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File berhasil dihapus: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error saat menghapus file: ${error.message}`);
  }
};

module.exports = {
  handleUpload,
  deleteFile,
  uploadDir
};
