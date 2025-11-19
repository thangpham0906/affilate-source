const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');
const { upload, handleMulterError } = require('../../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile);
router.put('/change-password', authMiddleware.verifyToken, authController.changePassword);

// Upload image routes
router.post('/upload-image', 
  authMiddleware.verifyToken, 
  upload.single('image'),
  handleMulterError,
  authController.uploadImage
);

router.delete('/delete-image', 
  authMiddleware.verifyToken, 
  authController.deleteImage
);

module.exports = router;
