const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const routes = require('./modules');
const config = require('./config/env.config');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors(config.cors));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/media/images', express.static(path.join(__dirname, '../images')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Node.js Modular API with MySQL',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// API Routes
app.use('/api', routes);

// Handle 404 Not Found
app.use(notFound);
app.use(errorHandler);

// Start the server after testing DB connection and syncing
const startServer = async () => {
  try {
    logger.system('application_starting', { port: config.port, env: config.nodeEnv });
    
    await testConnection();
    await syncDatabase({ 
      alter: config.nodeEnv === 'development'
    });
    
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`💾 Database: MySQL`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Invoke the server start
startServer();

module.exports = app;
