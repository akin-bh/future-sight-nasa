const express = require('express');
const router = express.Router();

// Get humidity data for a specific date
router.get('/humidity/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    const humidityProcessor = req.app.locals.humidityProcessor;
    
    if (!humidityProcessor.isDataLoaded()) {
      return res.status(503).json({
        error: 'Humidity data not available',
        message: 'Humidity data is not loaded or failed to load'
      });
    }

    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please use YYYY-MM-DD format'
      });
    }

    const humidityData = humidityProcessor.getHumidityForDate(requestedDate);
    
    if (!humidityData) {
      return res.status(404).json({
        error: 'No data found',
        message: `No humidity data available for ${date}`
      });
    }

    res.json({
      success: true,
      data: humidityData,
      metadata: {
        source: 'NASA GLDAS Model',
        description: 'Specific humidity 3-hourly 0.25 deg',
        unit: 'kg/kg'
      }
    });

  } catch (error) {
    console.error('Error in humidity date endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve humidity data'
    });
  }
});

// Get humidity data for a date range
router.get('/humidity/range', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const humidityProcessor = req.app.locals.humidityProcessor;
    
    if (!humidityProcessor.isDataLoaded()) {
      return res.status(503).json({
        error: 'Humidity data not available',
        message: 'Humidity data is not loaded or failed to load'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Please provide both startDate and endDate query parameters'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Please use YYYY-MM-DD format for dates'
      });
    }

    if (start > end) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }

    // Limit range to prevent excessive data
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return res.status(400).json({
        error: 'Date range too large',
        message: 'Maximum allowed range is 365 days'
      });
    }

    const humidityData = humidityProcessor.getHumidityRange(start, end);
    
    res.json({
      success: true,
      data: humidityData,
      count: humidityData.length,
      dateRange: {
        start: startDate,
        end: endDate
      },
      metadata: {
        source: 'NASA GLDAS Model',
        description: 'Specific humidity 3-hourly 0.25 deg',
        unit: 'kg/kg'
      }
    });

  } catch (error) {
    console.error('Error in humidity range endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve humidity data'
    });
  }
});

// Get monthly humidity statistics
router.get('/humidity/monthly/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const humidityProcessor = req.app.locals.humidityProcessor;
    
    if (!humidityProcessor.isDataLoaded()) {
      return res.status(503).json({
        error: 'Humidity data not available',
        message: 'Humidity data is not loaded or failed to load'
      });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'Year must be a valid number and month must be between 1-12'
      });
    }

    const monthlyStats = humidityProcessor.getMonthlyStatistics(yearNum, monthNum);
    
    if (!monthlyStats) {
      return res.status(404).json({
        error: 'No data found',
        message: `No humidity data available for ${year}-${month.toString().padStart(2, '0')}`
      });
    }

    res.json({
      success: true,
      data: monthlyStats,
      metadata: {
        source: 'NASA GLDAS Model',
        description: 'Specific humidity 3-hourly 0.25 deg',
        unit: 'kg/kg'
      }
    });

  } catch (error) {
    console.error('Error in humidity monthly endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve monthly humidity statistics'
    });
  }
});

// Get humidity data summary
router.get('/humidity/summary', (req, res) => {
  try {
    const humidityProcessor = req.app.locals.humidityProcessor;
    
    if (!humidityProcessor.isDataLoaded()) {
      return res.status(503).json({
        error: 'Humidity data not available',
        message: 'Humidity data is not loaded or failed to load'
      });
    }

    const summary = humidityProcessor.getDataSummary();
    
    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error in humidity summary endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve humidity data summary'
    });
  }
});

// Humidity analysis endpoint (similar to temperature analysis)
router.post('/humidity-analysis', (req, res) => {
  try {
    const { location, month, day, year, threshold, operator = '>=' } = req.body;
    const humidityProcessor = req.app.locals.humidityProcessor;
    
    if (!humidityProcessor.isDataLoaded()) {
      return res.status(503).json({
        error: 'Humidity data not available',
        message: 'Humidity data is not loaded or failed to load'
      });
    }

    // Validate inputs
    if (!month || !day || !threshold) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Month, day, and threshold are required'
      });
    }

    // Generate analysis for the past 10 years if no specific year provided
    const currentYear = new Date().getFullYear();
    const analysisYears = year ? [year] : Array.from({length: 10}, (_, i) => currentYear - 10 + i);
    
    const analysisData = [];
    let exceedCount = 0;
    
    analysisYears.forEach(analysisYear => {
      const date = new Date(analysisYear, month - 1, day);
      const humidityData = humidityProcessor.getHumidityForDate(date);
      
      if (humidityData) {
        const value = humidityData.averageHumidity;
        const exceeds = operator === '>=' ? value >= threshold : value <= threshold;
        
        if (exceeds) exceedCount++;
        
        analysisData.push({
          year: analysisYear,
          month: month,
          day: day,
          date: date.toISOString().split('T')[0],
          humidity: value,
          exceeds: exceeds,
          source: 'NASA GLDAS'
        });
      }
    });

    const probability = analysisData.length > 0 ? (exceedCount / analysisData.length) * 100 : 0;
    const averageHumidity = analysisData.length > 0 ? 
      analysisData.reduce((sum, d) => sum + d.humidity, 0) / analysisData.length : 0;

    res.json({
      success: true,
      query: {
        location: location || 'Global',
        month,
        day,
        year,
        threshold,
        operator
      },
      analysis: {
        probability: probability,
        averageHumidity: averageHumidity,
        dataYears: analysisData.length,
        exceedCount: exceedCount
      },
      historicalData: analysisData,
      metadata: {
        source: 'NASA GLDAS Model',
        description: 'Specific humidity 3-hourly 0.25 deg analysis',
        unit: 'kg/kg',
        analysisType: year ? 'specific-year' : 'historical-probability'
      }
    });

  } catch (error) {
    console.error('Error in humidity analysis endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform humidity analysis'
    });
  }
});

module.exports = router;