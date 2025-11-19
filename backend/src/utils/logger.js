const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  /**
   * Đảm bảo thư mục logs tồn tại
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Lấy timestamp hiện tại
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Lấy tên file log theo ngày
   */
  getLogFileName(type = 'app') {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${type}-${dateStr}.log`;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  /**
   * Ghi log vào file
   */
  writeToFile(filename, content) {
    const filePath = path.join(this.logsDir, filename);
    try {
      fs.appendFileSync(filePath, content, 'utf8');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Log INFO
   */
  info(message, meta = {}) {
    const logMessage = this.formatMessage('info', message, meta);
    console.log(`ℹ️  ${message}`);
    this.writeToFile(this.getLogFileName('app'), logMessage);
  }

  /**
   * Log ERROR
   */
  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      ...meta,
      error: error.message,
      stack: error.stack
    } : meta;
    
    const logMessage = this.formatMessage('error', message, errorMeta);
    console.error(`❌ ${message}`, error || '');
    this.writeToFile(this.getLogFileName('error'), logMessage);
    this.writeToFile(this.getLogFileName('app'), logMessage);
  }

  /**
   * Log WARNING
   */
  warn(message, meta = {}) {
    const logMessage = this.formatMessage('warn', message, meta);
    console.warn(`⚠️  ${message}`);
    this.writeToFile(this.getLogFileName('app'), logMessage);
  }

  /**
   * Log DEBUG (chỉ trong development)
   */
  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('debug', message, meta);
      console.log(`🔍 ${message}`);
      this.writeToFile(this.getLogFileName('debug'), logMessage);
    }
  }

  /**
   * Log HTTP Request
   */
  http(req, res, responseTime) {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      responseTime: `${responseTime}ms`
    };
    
    const logMessage = this.formatMessage('http', message, meta);
    
    // Console log với màu
    if (res.statusCode >= 500) {
      console.error(`🔴 ${message}`);
    } else if (res.statusCode >= 400) {
      console.warn(`🟡 ${message}`);
    } else {
      console.log(`🟢 ${message}`);
    }
    
    this.writeToFile(this.getLogFileName('http'), logMessage);
  }

  /**
   * Log Database Query
   */
  database(query, duration) {
    const message = `Query executed in ${duration}ms`;
    const meta = {
      query: query.length > 200 ? query.substring(0, 200) + '...' : query,
      duration: `${duration}ms`
    };
    
    const logMessage = this.formatMessage('database', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 ${message}`);
    }
    
    this.writeToFile(this.getLogFileName('database'), logMessage);
  }

  /**
   * Log Auth Activity
   */
  auth(action, userId, meta = {}) {
    const message = `Auth: ${action} - User: ${userId}`;
    const authMeta = {
      ...meta,
      action,
      userId,
      timestamp: this.getTimestamp()
    };
    
    const logMessage = this.formatMessage('auth', message, authMeta);
    console.log(`🔐 ${message}`);
    this.writeToFile(this.getLogFileName('auth'), logMessage);
    this.writeToFile(this.getLogFileName('app'), logMessage);
  }

  /**
   * Log System Events
   */
  system(event, meta = {}) {
    const message = `System: ${event}`;
    const logMessage = this.formatMessage('system', message, meta);
    console.log(`⚙️  ${message}`);
    this.writeToFile(this.getLogFileName('system'), logMessage);
  }

  /**
   * Clear old logs (older than X days)
   */
  clearOldLogs(daysToKeep = 30) {
    const files = fs.readdirSync(this.logsDir);
    const now = new Date();
    
    files.forEach(file => {
      const filePath = path.join(this.logsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = (now - stats.mtime) / (1000 * 60 * 60 * 24); // days
      
      if (fileAge > daysToKeep) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old log: ${file}`);
      }
    });
  }
}

// Export singleton instance
module.exports = new Logger();
