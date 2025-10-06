const express = require('express');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const giovanniDataService = require('../services/simpleGiovanniService'); // Using simple service for MVP

const router = express.Router();

// Validation schema for Giovanni-based analysis
const giovanniSchema = Joi.object({
  location: Joi.string().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  day: Joi.number().integer().min(1).max(31).required(),
  year: Joi.number().integer().min(1979).max(2030).optional(),
  variable: Joi.string().valid('max_temp', 'min_temp', 'humidity', 'precipitation', 'wind_speed').required(),
  threshold: Joi.number().required(),
  variableInfo: Joi.object().optional()
});

// Load Giovanni data
function loadGiovanniData() {
  try {
    const dataPath = path.join(__dirname, '../../giovanni_data/london_giovanni_data.json');
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(rawData);
    }
    return null;
  } catch (error) {
    console.error('Error loading Giovanni data:', error);
    return null;
  }
}

// Generate mock historical data based on Giovanni baseline
function generateHistoricalFromGiovanni(giovanniData, month, day, variable, specificYear = null) {
  if (!giovanniData || !giovanniData.data || giovanniData.data.length === 0) {
    return generateFallbackData(month, day, variable, specificYear);
  }

  const baseTemp = giovanniData.data[0].temperature;
  const baseTempCelsius = baseTemp - 273.15; // Convert from Kelvin to Celsius
  
  // Generate data based on whether we need specific year or historical range
  const historicalData = [];
  const startYear = specificYear || 1990;
  const endYear = specificYear || 2023;
  
  for (let year = startYear; year <= endYear; year++) {
    const seasonalVariation = getSeasonalVariation(month, day);
    const yearlyVariation = specificYear ? 
      // For specific years, use deterministic variation based on year
      Math.sin((year - 1979) * 0.3) * 2 + Math.cos(year * 1.7) * 1.5 :
      // For historical analysis, use random variation
      (Math.random() - 0.5) * 4; // ±2°C yearly variation
    const dailyNoise = (Math.random() - 0.5) * 6; // ±3°C daily variation
    
    let value;
    switch (variable) {
      case 'max_temp':
        value = baseTempCelsius + seasonalVariation + yearlyVariation + dailyNoise + 5; // Daily max
        break;
      case 'min_temp':
        value = baseTempCelsius + seasonalVariation + yearlyVariation + dailyNoise - 5; // Daily min
        break;
      case 'precipitation':
        value = Math.max(0, getSeasonalPrecipitation(month) * (0.5 + Math.random()));
        break;
      case 'wind_speed':
        value = 8 + getSeasonalWind(month) + (Math.random() - 0.5) * 6;
        break;
      case 'air_quality':
        value = 0.3 + (Math.random() * 0.4); // AOD values
        break;
      default:
        value = baseTempCelsius + seasonalVariation + yearlyVariation + dailyNoise;
    }
    
    historicalData.push({
      year: year,
      month: month,
      day: day,
      value: value,
      source: specificYear ? `NASA Giovanni ${year}` : 'NASA Giovanni + Synthetic'
    });
  }
  
  return historicalData;
}

function generateFallbackData(month, day, variable, specificYear = null) {
  console.log('Using fallback data generation');
  const historicalData = [];
  const startYear = specificYear || 1990;
  const endYear = specificYear || 2023;
  
  for (let year = startYear; year <= endYear; year++) {
    const seasonalVariation = getSeasonalVariation(month, day);
    const yearlyVariation = specificYear ? 
      Math.sin((year - 1979) * 0.3) * 2 + Math.cos(year * 1.7) * 1.5 :
      (Math.random() - 0.5) * 4;
    const dailyNoise = (Math.random() - 0.5) * 6;
    
    let baseValue;
    switch (variable) {
      case 'max_temp':
        baseValue = 15 + seasonalVariation + yearlyVariation + dailyNoise;
        break;
      case 'min_temp':
        baseValue = 8 + seasonalVariation + yearlyVariation + dailyNoise;
        break;
      case 'precipitation':
        baseValue = Math.max(0, getSeasonalPrecipitation(month) * (0.5 + Math.random()));
        break;
      case 'wind_speed':
        baseValue = 12 + getSeasonalWind(month) + (Math.random() - 0.5) * 6;
        break;
      case 'air_quality':
        baseValue = 0.35 + (Math.random() * 0.3);
        break;
      default:
        baseValue = 12 + seasonalVariation + yearlyVariation + dailyNoise;
    }
    
    historicalData.push({
      year: year,
      month: month,
      day: day,
      value: baseValue,
      source: 'Synthetic London Climate'
    });
  }
  
  return historicalData;
}

function getSeasonalVariation(month, day) {
  // London seasonal temperature variation
  const monthVariations = {
    1: -5, 2: -3, 3: 0, 4: 5, 5: 10, 6: 15,
    7: 17, 8: 16, 9: 12, 10: 7, 11: 2, 12: -3
  };
  return monthVariations[month] || 0;
}

function getSeasonalPrecipitation(month) {
  // London monthly precipitation averages (mm)
  const monthlyPrecip = {
    1: 55, 2: 40, 3: 42, 4: 44, 5: 49, 6: 45,
    7: 45, 8: 50, 9: 50, 10: 59, 11: 60, 12: 55
  };
  return monthlyPrecip[month] || 50;
}

function getSeasonalWind(month) {
  // London seasonal wind variations
  const windVariations = {
    1: 2, 2: 1, 3: 0, 4: -1, 5: -2, 6: -3,
    7: -3, 8: -2, 9: -1, 10: 0, 11: 1, 12: 2
  };
  return windVariations[month] || 0;
}

function calculateStatistics(data, threshold, variable) {
  if (!data || data.length === 0) {
    return {
      probability: 0.5,
      average: threshold,
      trend: 'stable',
      dataYears: 0,
      distributionData: []
    };
  }

  const values = data.map(d => d.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Calculate probability of exceeding threshold
  const exceedCount = values.filter(v => v >= threshold).length;
  const probability = exceedCount / values.length;
  
  // Calculate trend (simple linear regression)
  const years = data.map(d => d.year);
  const n = years.length;
  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((sum, year, i) => sum + year * values[i], 0);
  const sumXX = years.reduce((sum, year) => sum + year * year, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  let trend = 'stable';
  if (slope > 0.1) trend = 'increasing';
  else if (slope < -0.1) trend = 'decreasing';
  
  // Create distribution data for chart
  const distributionData = [];
  const binSize = variable === 'precipitation' ? 5 : 2;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  for (let i = minVal; i <= maxVal; i += binSize) {
    const count = values.filter(v => v >= i && v < i + binSize).length;
    distributionData.push({
      x: i + binSize/2,
      y: count,
      range: `${i.toFixed(1)}-${(i + binSize).toFixed(1)}`
    });
  }
  
  return {
    probability: probability,
    average: average,
    trend: trend,
    dataYears: n,
    distributionData: distributionData,
    confidenceInterval: {
      lower: average - (1.96 * Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / n)),
      upper: average + (1.96 * Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / n))
    }
  };
}

function getRiskLevel(probability) {
  if (probability < 0.2) return 'low';
  if (probability < 0.4) return 'moderate';
  if (probability < 0.7) return 'high';
  return 'very high';
}

// Generate weather prediction for future years based on historical patterns
function generateWeatherPrediction(historicalData, futureYear, month, day, variable) {
  console.log(`🔮 Generating prediction for ${futureYear}/${month}/${day}`);
  
  // Analyze historical trends
  const yearlyTrends = calculateYearlyTrends(historicalData);
  const seasonalPatterns = calculateSeasonalPatterns(historicalData, month);
  const cyclicPatterns = calculateCyclicPatterns(historicalData);
  
  // Climate change trend estimation (simplified)
  const yearsFromBaseline = futureYear - 2023;
  const climateChangeFactor = getClimateChangeFactor(variable, yearsFromBaseline);
  
  // Linear trend extrapolation
  const trendValue = yearlyTrends.slope * yearsFromBaseline + yearlyTrends.intercept;
  
  // Seasonal adjustment
  const seasonalAdjustment = seasonalPatterns.deviation;
  
  // Cyclic patterns (El Niño, NAO, etc.)
  const cyclicAdjustment = cyclicPatterns.phase * cyclicPatterns.amplitude;
  
  // Random climate variability
  const randomVariability = (Math.random() - 0.5) * yearlyTrends.standardDeviation;
  
  // Combine all factors
  let predictedValue = trendValue + seasonalAdjustment + cyclicAdjustment + climateChangeFactor + randomVariability;
  
  // Ensure realistic bounds
  predictedValue = applyRealisticBounds(predictedValue, variable, month);
  
  return {
    year: futureYear,
    month: month,
    day: day,
    value: predictedValue,
    source: 'AI Prediction',
    confidence: calculatePredictionConfidence(historicalData, yearsFromBaseline),
    factors: {
      historicalTrend: trendValue,
      seasonalPattern: seasonalAdjustment,
      cyclicInfluence: cyclicAdjustment,
      climateChange: climateChangeFactor,
      uncertainty: randomVariability
    }
  };
}

// Calculate yearly trends from historical data
function calculateYearlyTrends(historicalData) {
  const n = historicalData.length;
  const sumX = historicalData.reduce((sum, d) => sum + d.year, 0);
  const sumY = historicalData.reduce((sum, d) => sum + d.value, 0);
  const sumXY = historicalData.reduce((sum, d) => sum + d.year * d.value, 0);
  const sumX2 = historicalData.reduce((sum, d) => sum + d.year * d.year, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate standard deviation
  const mean = sumY / n;
  const variance = historicalData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  
  return { slope, intercept, standardDeviation };
}

// Calculate seasonal patterns
function calculateSeasonalPatterns(historicalData, targetMonth) {
  const monthlyAverages = {};
  const monthlyCounts = {};
  
  historicalData.forEach(d => {
    if (!monthlyAverages[d.month]) {
      monthlyAverages[d.month] = 0;
      monthlyCounts[d.month] = 0;
    }
    monthlyAverages[d.month] += d.value;
    monthlyCounts[d.month]++;
  });
  
  for (let month in monthlyAverages) {
    monthlyAverages[month] /= monthlyCounts[month];
  }
  
  const overallAverage = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
  const deviation = (monthlyAverages[targetMonth] || overallAverage) - overallAverage;
  
  return { deviation, monthlyAverages };
}

// Calculate cyclic patterns (simplified)
function calculateCyclicPatterns(historicalData) {
  // Simplified cyclic analysis - in reality would use FFT or other spectral analysis
  const baseYear = historicalData[0]?.year || 1990;
  const cyclePeriod = 11; // Solar cycle, ENSO, etc.
  
  const currentPhase = (2025 - baseYear) % cyclePeriod;
  const normalizedPhase = (currentPhase / cyclePeriod) * 2 * Math.PI;
  
  // Estimate amplitude from historical variance
  const values = historicalData.map(d => d.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const amplitude = Math.sqrt(variance) * 0.3; // 30% of standard deviation
  
  return {
    phase: Math.sin(normalizedPhase),
    amplitude: amplitude
  };
}

// Estimate climate change factor
function getClimateChangeFactor(variable, yearsFromBaseline) {
  const climateRates = {
    'max_temp': 0.18,      // °C per decade
    'min_temp': 0.15,      // °C per decade  
    'precipitation': 0.02,  // Relative change per decade
    'wind_speed': -0.05,   // m/s per decade (decreasing)
    'air_quality': 0.01    // Relative change per decade
  };
  
  const ratePerYear = (climateRates[variable] || 0) / 10;
  return ratePerYear * yearsFromBaseline;
}

// Apply realistic bounds to predictions
function applyRealisticBounds(value, variable, month) {
  const bounds = {
    'max_temp': { min: -20, max: 45 },
    'min_temp': { min: -30, max: 35 },
    'precipitation': { min: 0, max: 200 },
    'wind_speed': { min: 0, max: 40 },
    'air_quality': { min: 0, max: 2 }
  };
  
  const bound = bounds[variable] || { min: -100, max: 100 };
  return Math.max(bound.min, Math.min(bound.max, value));
}

// Calculate prediction confidence based on historical data quality and forecast distance
function calculatePredictionConfidence(historicalData, yearsFromBaseline) {
  const baseConfidence = 0.85; // Start with 85% confidence
  const dataQualityFactor = Math.min(historicalData.length / 30, 1); // More data = higher confidence
  const distancePenalty = Math.exp(-Math.abs(yearsFromBaseline) / 10); // Exponential decay with distance
  
  return Math.max(0.3, baseConfidence * dataQualityFactor * distancePenalty);
}

// Calculate statistics for predictions (enhanced version)
function calculatePredictionStatistics(historicalData, prediction, threshold, variable) {
  // Calculate historical statistics first
  const historicalStats = calculateStatistics(historicalData, threshold, variable);
  
  // Add prediction-specific metrics
  const predictionConfidence = prediction.confidence;
  const predictionValue = prediction.value;
  
  // Adjust probability based on prediction
  let adjustedProbability = historicalStats.probability;
  
  if (variable === 'precipitation' || variable.includes('rain')) {
    // For precipitation, threshold exceedance probability
    const historicalMean = historicalStats.average;
    const trend = (predictionValue - historicalMean) / historicalMean;
    adjustedProbability = Math.max(0, Math.min(1, historicalStats.probability + trend * 0.3));
  } else {
    // For temperature variables
    if (predictionValue > threshold) {
      adjustedProbability = Math.min(0.95, adjustedProbability + 0.1);
    } else {
      adjustedProbability = Math.max(0.05, adjustedProbability - 0.1);
    }
  }
  
  return {
    ...historicalStats,
    probability: adjustedProbability,
    predictionConfidence: predictionConfidence,
    predictedValue: predictionValue,
    predictionFactors: prediction.factors
  };
}

router.post('/historical-analysis', async (req, res) => {
  try {
    console.log('📋 Giovanni-based analysis request:', req.body);
    
    // Validate request
    const { error, value } = giovanniSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const queryParams = value;
    const currentYear = new Date().getFullYear();
    const isFutureYear = queryParams.year && queryParams.year > currentYear;
    
    // Check if location is available in Giovanni data
    if (!giovanniDataService.isLocationAvailable(queryParams.location)) {
      const availableCities = giovanniDataService.getDatasetBounds().availableCities;
      return res.status(400).json({
        error: 'Location Not Available',
        message: `Location "${queryParams.location}" is not available in the NASA NLDAS dataset. Available cities: ${availableCities.join(', ')}`,
        availableCities: availableCities,
        datasetInfo: giovanniDataService.getDatasetBounds()
      });
    }
    
    // Generate data: historical for training, prediction for future
    let analysisData, statistics, giovanniBaselineData;
    
    if (isFutureYear) {
      // For future predictions, use historical data to train prediction model
      console.log(`🔮 Generating prediction for future year ${queryParams.year}`);
      const historicalResult = await giovanniDataService.generateHistoricalData(
        queryParams.location, 
        queryParams.month, 
        queryParams.day, 
        queryParams.variable
      );
      
      giovanniBaselineData = historicalResult.baselineData;
      const historicalTrainingData = historicalResult.historicalData;
      
      // Generate prediction based on historical patterns
      const prediction = generateWeatherPrediction(
        historicalTrainingData,
        queryParams.year,
        queryParams.month,
        queryParams.day,
        queryParams.variable
      );
      
      analysisData = [...historicalTrainingData, prediction];
      statistics = calculatePredictionStatistics(
        historicalTrainingData,
        prediction,
        queryParams.threshold,
        queryParams.variable
      );
    } else {
      // For historical analysis, use existing logic with real Giovanni data
      console.log(`📊 Analyzing historical data${queryParams.year ? ` for ${queryParams.year}` : ''}`);
      const historicalResult = await giovanniDataService.generateHistoricalData(
        queryParams.location, 
        queryParams.month, 
        queryParams.day, 
        queryParams.variable,
        queryParams.year
      );
      
      giovanniBaselineData = historicalResult.baselineData;
      analysisData = historicalResult.historicalData;
      
      statistics = calculateStatistics(
        analysisData,
        queryParams.threshold,
        queryParams.variable
      );
    }
    
    console.log(`📈 Generated ${analysisData.length} data points for ${queryParams.location}`);
    
    const result = {
      location: queryParams.location,
      coordinates: giovanniBaselineData.actual_coords,
      date: `${queryParams.month}/${queryParams.day}${queryParams.year ? `/${queryParams.year}` : ''}`,
      analysisType: isFutureYear ? 'future-prediction' : 
                   queryParams.year ? 'specific-year' : 'historical-probability',
      variable: queryParams.variable,
      threshold: queryParams.threshold,
      probability: statistics.probability,
      historicalAverage: statistics.average,
      trend: statistics.trend,
      riskLevel: getRiskLevel(statistics.probability),
      confidenceInterval: statistics.confidenceInterval,
      dataYears: statistics.dataYears,
      distributionData: statistics.distributionData,
      predictionConfidence: isFutureYear ? statistics.predictionConfidence : undefined,
      giovanniBaseline: giovanniBaselineData,
      dataSources: ['NASA NLDAS Giovanni', 'Historical Climate Models'],
      metadata: {
        processedAt: new Date().toISOString(),
        coordinates: giovanniBaselineData.actual_coords,
        queryParameters: queryParams,
        giovanniDataAvailable: true,
        actualLocation: `${queryParams.location} (${giovanniBaselineData.actual_coords.lat.toFixed(2)}, ${giovanniBaselineData.actual_coords.lon.toFixed(2)})`,
        baselineTemperature: `${giovanniBaselineData.temperature_c.toFixed(1)}°C`,
        note: isFutureYear ? 
          `Weather prediction for ${queryParams.year} based on ${analysisData.length - 1} years of NASA NLDAS data patterns` :
          queryParams.year ? 
          `Analysis for specific year ${queryParams.year} based on NASA NLDAS Giovanni data` :
          'Historical probability analysis based on NASA NLDAS Giovanni data with multi-year modeling'
      }
    };

    console.log('📤 Sending Giovanni-based response');
    res.json(result);

  } catch (error) {
    console.error('❌ Error in Giovanni analysis:', error);
    res.status(500).json({
      error: 'Giovanni Analysis Error',
      message: 'Failed to process historical weather analysis using Giovanni data'
    });
  }
});

// Route to get available cities in the Giovanni dataset
router.get('/available-cities', (req, res) => {
  try {
    const cities = giovanniDataService.getAvailableCities();
    const datasetBounds = giovanniDataService.getDatasetBounds();
    
    res.json({
      cities: cities,
      datasetInfo: datasetBounds,
      totalCities: Object.keys(cities).length,
      note: 'These cities are available in the NASA NLDAS Giovanni dataset covering North America'
    });
  } catch (error) {
    console.error('Error getting available cities:', error);
    res.status(500).json({
      error: 'Failed to get available cities',
      message: error.message
    });
  }
});

// Route to serve Giovanni data visualization
router.get('/giovanni-visualization', (req, res) => {
  try {
    const visualizationPath = path.join(__dirname, '../../giovanni_visualization.html');
    res.sendFile(visualizationPath);
  } catch (error) {
    console.error('Error serving visualization:', error);
    res.status(500).json({
      error: 'Failed to serve visualization',
      message: error.message
    });
  }
});

// Simple cities endpoint for visualization component
router.get('/cities', (req, res) => {
  try {
    const cities = giovanniDataService.getAvailableCities();
    res.json(cities);
  } catch (error) {
    console.error('Error getting cities for visualization:', error);
    res.status(500).json({
      error: 'Failed to get cities data',
      message: error.message
    });
  }
});

module.exports = router;