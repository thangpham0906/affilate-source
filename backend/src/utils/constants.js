/**
 * HTTP Status Codes
 */
exports.HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Error Messages
 */
exports.ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  
  // General
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  
  // Database
  DB_CONNECTION_ERROR: 'Database connection error',
  DB_OPERATION_FAILED: 'Database operation failed',
};

/**
 * Success Messages
 */
exports.SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // General
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
};

/**
 * User Roles
 */
exports.USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

/**
 * Pagination Defaults
 */
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * Regex Patterns
 */
exports.REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  MONGODB_OBJECTID: /^[0-9a-fA-F]{24}$/,
};

/**
 * Token Expiration Times
 */
exports.TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_PASSWORD: '1h',
  EMAIL_VERIFICATION: '24h',
};
