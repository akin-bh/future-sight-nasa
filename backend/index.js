const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const historicalAnalysisRoutes = require('./routes/historicalAnalysis');
const geocodingRoutes = require('./routes/geocoding');
const testAnalysisRoutes = require('./routes/testAnalysis');
const giovanniAnalysisRoutes = require('./routes/giovanniAnalysis');
const humidityRoutes = require('./routes/humidityRoutes');
const { router: precipitationRoutes, initializePrecipitationProcessor } = require('./routes/precipitationRoutes');
const { router: windSpeedRoutes, initializeWindSpeedProcessor } = require('./routes/windSpeedRoutes');
const HumidityProcessor = require('./humidityProcessor');
const PrecipitationProcessor = require('./precipitationProcessor');
const WindSpeedProcessor = require('./windSpeedProcessor');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize humidity processor
const humidityProcessor = new HumidityProcessor();

// Initialize precipitation processor
const precipitationProcessor = new PrecipitationProcessor();

// Initialize wind speed processor
const windSpeedProcessor = new WindSpeedProcessor();

// Load humidity data on startup
humidityProcessor.loadHumidityData().then(success => {
  if (success) {
    console.log('✅ Humidity data loaded successfully');
    const summary = humidityProcessor.getDataSummary();
    console.log('📊 Humidity data summary:', summary);
  } else {
    console.log('⚠️  Humidity data not loaded - continuing without humidity features');
  }
}).catch(error => {
  console.error('❌ Error loading humidity data:', error);
});

// Load precipitation data on startup
precipitationProcessor.loadPrecipitationData().then(() => {
  console.log('✅ Precipitation data loaded successfully');
  const summary = precipitationProcessor.getDataSummary();
  console.log('📊 Precipitation data summary:', summary);
  
  // Initialize precipitation routes with processor
  initializePrecipitationProcessor(precipitationProcessor);
}).catch(error => {
  console.error('❌ Error loading precipitation data:', error);
});

// Load wind speed data on startup
windSpeedProcessor.loadWindSpeedData().then(() => {
  console.log('✅ Wind speed data loaded successfully');
  const summary = windSpeedProcessor.getDataSummary();
  console.log('📊 Wind speed data summary:', summary);
  
  // Initialize wind speed routes with processor
  initializeWindSpeedProcessor(windSpeedProcessor);
}).catch(error => {
  console.error('❌ Error loading wind speed data:', error);
});

// Make processors available to routes
app.locals.humidityProcessor = humidityProcessor;
app.locals.precipitationProcessor = precipitationProcessor;
app.locals.windSpeedProcessor = windSpeedProcessor;

// Security middleware
app.use(helmet());

// Rate limiting - temporarily disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
//   trustProxy: false,
//   skipSuccessfulRequests: false,
//   skipFailedRequests: false
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'weather-risk-api'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// API routes - Using Giovanni data instead of original analysis
app.use('/api', giovanniAnalysisRoutes);
app.use('/api', geocodingRoutes);
app.use('/api', testAnalysisRoutes);
app.use('/api', humidityRoutes);
app.use('/api', precipitationRoutes);
app.use('/api', windSpeedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.details[0].message
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred while processing your request'
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Future Sight API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Access at: http://localhost:${PORT}`);
});