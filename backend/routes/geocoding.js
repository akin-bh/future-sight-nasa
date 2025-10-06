const express = require('express');
const Joi = require('joi');

const router = express.Router();

// Validation schema for geocoding request
const geocodingSchema = Joi.object({
  location: Joi.string().required()
});

router.post('/geocode', async (req, res) => {
  try {
    const { error, value } = geocodingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { location } = value;

    // Mock geocoding implementation
    // In production, integrate with a real geocoding service
    const coordinates = await mockGeocoding(location);

    if (!coordinates) {
      return res.status(404).json({
        error: 'Location Not Found',
        message: 'Unable to find coordinates for the specified location'
      });
    }

    res.json({
      location: location,
      coordinates: coordinates,
      source: 'mock-geocoding'
    });

  } catch (error) {
    console.error('Error in geocoding:', error);
    res.status(500).json({
      error: 'Geocoding Error',
      message: 'Failed to geocode location. Please try again later.'
    });
  }
});

// Mock geocoding function
async function mockGeocoding(location) {
  const mockCoordinates = {
    // Major US cities
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'new york, ny': { latitude: 40.7128, longitude: -74.0060 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'los angeles, ca': { latitude: 34.0522, longitude: -118.2437 },
    'chicago': { latitude: 41.8781, longitude: -87.6298 },
    'chicago, il': { latitude: 41.8781, longitude: -87.6298 },
    'houston': { latitude: 29.7604, longitude: -95.3698 },
    'houston, tx': { latitude: 29.7604, longitude: -95.3698 },
    'phoenix': { latitude: 33.4484, longitude: -112.0740 },
    'phoenix, az': { latitude: 33.4484, longitude: -112.0740 },
    'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
    'philadelphia, pa': { latitude: 39.9526, longitude: -75.1652 },
    'san antonio': { latitude: 29.4241, longitude: -98.4936 },
    'san antonio, tx': { latitude: 29.4241, longitude: -98.4936 },
    'san diego': { latitude: 32.7157, longitude: -117.1611 },
    'san diego, ca': { latitude: 32.7157, longitude: -117.1611 },
    'dallas': { latitude: 32.7767, longitude: -96.7970 },
    'dallas, tx': { latitude: 32.7767, longitude: -96.7970 },
    'san jose': { latitude: 37.3382, longitude: -121.8863 },
    'san jose, ca': { latitude: 37.3382, longitude: -121.8863 },
    
    // International cities
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'london, uk': { latitude: 51.5074, longitude: -0.1278 },
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'paris, france': { latitude: 48.8566, longitude: 2.3522 },
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'tokyo, japan': { latitude: 35.6762, longitude: 139.6503 },
    'sydney': { latitude: -33.8688, longitude: 151.2093 },
    'sydney, australia': { latitude: -33.8688, longitude: 151.2093 },
    'berlin': { latitude: 52.5200, longitude: 13.4050 },
    'berlin, germany': { latitude: 52.5200, longitude: 13.4050 }
  };

  const normalizedLocation = location.toLowerCase().trim();
  return mockCoordinates[normalizedLocation] || null;
}

module.exports = router;