const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Đảm bảo thư mục images/users tồn tại
const uploadDir = path.join(__dirname, '../../images/users');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : 'guest';
    const filename = `user_${userId}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter - chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    logger.info('File upload accepted', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    return cb(null, true);
  } else {
    logger.warn('File upload rejected - invalid type', {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware xử lý error từ multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error('Multer error', err);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    logger.error('Upload error', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Error uploading file'
    });
  }
  next();
};

/**
 * Xóa file ảnh cũ
 */
const deleteOldImage = (imagePath) => {
  if (!imagePath) return;
  
  try {
    const fullPath = path.join(__dirname, '../../', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      logger.info('Old image deleted', { path: imagePath });
    }
  } catch (error) {
    logger.error('Failed to delete old image', error, { path: imagePath });
  }
};

/**
 * Lấy URL đầy đủ của ảnh
 */
const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${imagePath}`;
};

module.exports = {
  upload,
  handleMulterError,
  deleteOldImage,
  getImageUrl
};
