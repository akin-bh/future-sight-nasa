const express = require('express');
const Joi = require('joi');

const router = express.Router();

// Simple validation schema
const testSchema = Joi.object({
  location: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  month: Joi.number().integer().min(1).max(12).required(),
  day: Joi.number().integer().min(1).max(31).required(),
  variable: Joi.string().required(),
  threshold: Joi.number().required(),
  variableInfo: Joi.object().optional()
});

router.post('/test-analysis', async (req, res) => {
  try {
    console.log('🧪 Test analysis request received:', req.body);
    
    // Validate request
    const { error, value } = testSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    console.log('✅ Validation passed');

    // Return simple mock data
    const result = {
      location: 'London, UK',
      coordinates: { latitude: 51.5074, longitude: -0.1278 },
      date: `${value.month}/${value.day}`,
      variable: value.variable,
      threshold: value.threshold,
      probability: 0.65,
      historicalAverage: 22.5,
      trend: 'stable',
      riskLevel: 'moderate',
      dataYears: 34,
      metadata: {
        processedAt: new Date().toISOString(),
        note: 'This is simple test data to verify API connectivity'
      }
    };

    console.log('📤 Sending test response');
    res.json(result);

  } catch (error) {
    console.error('❌ Error in test analysis:', error);
    res.status(500).json({
      error: 'Test Error',
      message: 'Failed to process test analysis request'
    });
  }
});

module.exports = router;