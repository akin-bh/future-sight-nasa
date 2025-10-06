const express = require('express');
const Joi = require('joi');
const { processHistoricalAnalysis } = require('../services/nasaDataService');
const { calculateStatistics } = require('../utils/statisticalCalculations');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Validation schema for historical analysis request
const analysisSchema = Joi.object({
  location: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  month: Joi.number().integer().min(1).max(12).required(),
  day: Joi.number().integer().min(1).max(31).required(),
  variable: Joi.string().valid(
    'max_temp', 'min_temp', 'precipitation', 
    'wind_speed', 'humidity', 'air_quality'
  ).required(),
  threshold: Joi.number().required(),
  variableInfo: Joi.object().optional()
});

// Helper function to get London coordinates
function getLondonCoordinates() {
  return {
    latitude: 51.5074,
    longitude: -0.1278
  };
}

router.post('/historical-analysis', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = analysisSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    let queryParams = value;

    // For now, always use London coordinates regardless of input
    const londonCoords = getLondonCoordinates();
    queryParams.latitude = londonCoords.latitude;
    queryParams.longitude = londonCoords.longitude;
    queryParams.location = 'London, UK';

    // Create cache key based on query parameters
    const cacheKey = JSON.stringify({
      location: queryParams.location,
      lat: queryParams.latitude,
      lon: queryParams.longitude,
      month: queryParams.month,
      day: queryParams.day,
      variable: queryParams.variable,
      threshold: queryParams.threshold
    });

    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit for query:', cacheKey.substring(0, 100) + '...');
      return res.json(cachedResult);
    }

    console.log('🔍 Processing historical analysis request:', {
      location: queryParams.location || `${queryParams.latitude}, ${queryParams.longitude}`,
      date: `${queryParams.month}/${queryParams.day}`,
      variable: queryParams.variable,
      threshold: queryParams.threshold
    });

    // Step 1: Get coordinates if location name provided
    let coordinates = {
      latitude: queryParams.latitude,
      longitude: queryParams.longitude
    };

    if (queryParams.location) {
      // In a real implementation, you would geocode the location
      // For now, we'll use a mock coordinate for demonstration
      coordinates = await mockGeocoding(queryParams.location);
    }

    // Step 2: Fetch historical NASA data
    const historicalData = await processHistoricalAnalysis({
      ...coordinates,
      month: queryParams.month,
      day: queryParams.day,
      variable: queryParams.variable
    });

    // Step 3: Calculate statistics
    const statistics = calculateStatistics(
      historicalData, 
      queryParams.threshold,
      queryParams.variable
    );

    // Step 4: Prepare response
    const result = {
      probability: statistics.probability,
      historicalMean: statistics.mean,
      trendChange: statistics.trendChange,
      trendAnalysis: statistics.trendAnalysis,
      dataYears: statistics.dataYears,
      distributionData: statistics.distributionData,
      dataSources: getDataSources(queryParams.variable),
      metadata: {
        processedAt: new Date().toISOString(),
        coordinates: coordinates,
        queryParameters: queryParams
      }
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);

  } catch (error) {
    console.error('❌ Error in historical analysis:', error);
    res.status(500).json({
      error: 'Processing Error',
      message: 'Failed to process historical weather analysis. Please try again later.'
    });
  }
});

// Mock geocoding function (replace with real geocoding service)
async function mockGeocoding(location) {
  // This is a mock implementation
  // In production, you would use a real geocoding service like Google Maps API
  const mockCoordinates = {
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'chicago': { latitude: 41.8781, longitude: -87.6298 },
    'houston': { latitude: 29.7604, longitude: -95.3698 },
    'phoenix': { latitude: 33.4484, longitude: -112.0740 }
  };

  const normalizedLocation = location.toLowerCase();
  const coords = mockCoordinates[normalizedLocation] || { latitude: 40.7128, longitude: -74.0060 };
  
  return coords;
}

function getDataSources(variable) {
  const sources = {
    'max_temp': [
      {
        name: 'MERRA-2 Reanalysis',
        url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/'
      }
    ],
    'min_temp': [
      {
        name: 'MERRA-2 Reanalysis',
        url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/'
      }
    ],
    'precipitation': [
      {
        name: 'GPM (Global Precipitation Measurement)',
        url: 'https://gpm.nasa.gov/'
      },
      {
        name: 'TRMM Multi-satellite Precipitation Analysis',
        url: 'https://trmm.gsfc.nasa.gov/'
      }
    ],
    'wind_speed': [
      {
        name: 'MERRA-2 Reanalysis',
        url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/'
      }
    ],
    'air_quality': [
      {
        name: 'MODIS Aerosol Optical Depth',
        url: 'https://modis.gsfc.nasa.gov/'
      }
    ]
  };

  return sources[variable] || [];
}

module.exports = router;