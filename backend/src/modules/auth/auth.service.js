const User = require('./user.model');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

class AuthService {
  async register(userData) {
    const { email, password, name } = userData;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const user = await User.create({ email, password, name });
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return { user, accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret');
      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
      const newAccessToken = this.generateAccessToken(user);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId) {
    const user = await User.findByPk(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'refreshToken'] }
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const { name, email } = updateData;
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await user.update({ name, email });
    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId, {
      attributes: { include: ['password'] }
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  /**
   * Cập nhật ảnh profile
   */
  async updateImage(userId, imagePath) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.image = imagePath;
    await user.save();
    return user;
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthService();
