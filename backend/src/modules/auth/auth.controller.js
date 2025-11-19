const authService = require('./auth.service');
const { getImageUrl, deleteOldImage } = require('../../middleware/upload');
const logger = require('../../utils/logger');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email, password, and name'
        });
      }
      const result = await authService.register({ email, password, name });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }
      const result = await authService.login(email, password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }
      const result = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await authService.logout(userId);
      res.json({
        success: true,
        message: 'Logged out successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;
      const user = await authService.updateProfile(userId, { name, email });
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide old password and new password'
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }
      const result = await authService.changePassword(userId, oldPassword, newPassword);
      res.json({
        success: true,
        message: 'Password changed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload/Update profile image
   */
  async uploadImage(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }

      // Đường dẫn relative để lưu vào database
      const imagePath = `images/users/${req.file.filename}`;
      
      // Lấy user hiện tại để xóa ảnh cũ
      const user = await authService.getProfile(userId);
      if (user.image) {
        deleteOldImage(user.image);
      }
      
      // Cập nhật đường dẫn ảnh mới vào database
      const updatedUser = await authService.updateImage(userId, imagePath);
      
      logger.auth('profile_image_updated', userId, {
        filename: req.file.filename,
        size: req.file.size
      });
      
      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          user: updatedUser,
          imageUrl: getImageUrl(req, imagePath)
        }
      });
    } catch (error) {
      // Xóa file đã upload nếu có lỗi
      if (req.file) {
        deleteOldImage(`images/users/${req.file.filename}`);
      }
      logger.error('Upload image failed', error, { userId: req.user.id });
      next(error);
    }
  }

  /**
   * Delete profile image
   */
  async deleteImage(req, res, next) {
    try {
      const userId = req.user.id;
      
      const user = await authService.getProfile(userId);
      
      if (!user.image) {
        return res.status(400).json({
          success: false,
          message: 'No profile image to delete'
        });
      }
      
      // Xóa file ảnh
      deleteOldImage(user.image);
      
      // Cập nhật database
      await authService.updateImage(userId, null);
      
      logger.auth('profile_image_deleted', userId);
      
      res.json({
        success: true,
        message: 'Profile image deleted successfully'
      });
    } catch (error) {
      logger.error('Delete image failed', error, { userId: req.user.id });
      next(error);
    }
  }
}

module.exports = new AuthController();
