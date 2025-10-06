const axios = require('axios');

/**
 * NASA Data Service for retrieving historical weather data
 * This is a mock implementation that simulates NASA Earth Observation data
 * In production, this would integrate with real NASA APIs like:
 * - NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)
 * - Google Earth Engine with NASA datasets
 * - NASA POWER (Prediction of Worldwide Energy Resources)
 */

class NASADataService {
  constructor() {
    this.baseUrl = process.env.NASA_API_BASE_URL || 'https://power.larc.nasa.gov/api';
    this.apiKey = process.env.NASA_API_KEY;
  }

  /**
   * Process historical analysis for a given location and parameters
   */
  async processHistoricalAnalysis({ latitude, longitude, month, day, variable }) {
    try {
      console.log(`🛰️ Fetching NASA data for ${latitude}, ${longitude} on ${month}/${day} for ${variable}`);
      
      // In production, you would make real API calls to NASA services
      // For demonstration, we'll generate realistic mock data
      const historicalData = await this.generateMockHistoricalData({
        latitude,
        longitude,
        month,
        day,
        variable
      });

      return historicalData;
    } catch (error) {
      console.error('Error fetching NASA data:', error);
      throw new Error('Failed to retrieve NASA Earth Observation data');
    }
  }

  /**
   * Generate mock historical data that simulates NASA EO data
   * This creates realistic patterns based on location and seasonality
   */
  async generateMockHistoricalData({ latitude, longitude, month, day, variable }) {
    const startYear = 1990;
    const endYear = 2023;
    const years = endYear - startYear + 1;
    const data = [];

    // Generate data for each year
    for (let year = startYear; year <= endYear; year++) {
      const value = this.generateRealisticValue({
        latitude,
        longitude,
        year,
        month,
        day,
        variable
      });
      
      data.push({
        year,
        month,
        day,
        value,
        date: new Date(year, month - 1, day)
      });
    }

    return {
      data,
      metadata: {
        variable,
        location: { latitude, longitude },
        period: { start: startYear, end: endYear },
        dataSource: this.getDataSource(variable),
        totalRecords: data.length
      }
    };
  }

  /**
   * Generate realistic weather values based on location and seasonality
   */
  generateRealisticValue({ latitude, longitude, year, month, day, variable }) {
    // Base patterns for different variables
    const patterns = {
      max_temp: () => this.generateTemperature('max', latitude, month, day, year),
      min_temp: () => this.generateTemperature('min', latitude, month, day, year),
      precipitation: () => this.generatePrecipitation(latitude, longitude, month, day, year),
      wind_speed: () => this.generateWindSpeed(latitude, longitude, month, day, year),
      heat_index: () => this.generateHeatIndex(latitude, month, day, year),
      air_quality: () => this.generateAirQuality(latitude, longitude, month, day, year)
    };

    const generator = patterns[variable];
    if (!generator) {
      throw new Error(`Unsupported variable: ${variable}`);
    }

    return generator();
  }

  generateTemperature(type, latitude, month, day, year) {
    // Basic temperature model based on latitude and seasonality
    const isNorthern = latitude > 0;
    const dayOfYear = this.getDayOfYear(month, day);
    
    // Seasonal variation (cosine wave with peak in summer for northern hemisphere)
    const seasonalPeak = isNorthern ? 172 : 355; // June 21 vs Dec 21
    const seasonalVariation = Math.cos(2 * Math.PI * (dayOfYear - seasonalPeak) / 365);
    
    // Base temperature depends on latitude
    const latitudeEffect = Math.cos(Math.abs(latitude) * Math.PI / 180);
    const baseTemp = 15 + latitudeEffect * 20; // 15°C base + up to 20°C latitude adjustment
    
    // Seasonal amplitude (larger swings at higher latitudes)
    const seasonalAmplitude = 15 + Math.abs(latitude) / 6;
    
    // Daily temperature with seasonal variation
    let temp = baseTemp + seasonalVariation * seasonalAmplitude;
    
    // Max vs min temperature difference
    if (type === 'max') {
      temp += 8; // Max temp is ~8°C higher than mean
    } else {
      temp -= 8; // Min temp is ~8°C lower than mean
    }
    
    // Add climate change trend (warming over years)
    const climateChange = (year - 1990) * 0.02; // 0.02°C per year
    temp += climateChange;
    
    // Add random variation
    const randomVariation = (Math.random() - 0.5) * 10;
    temp += randomVariation;
    
    return Math.round(temp * 10) / 10; // Round to 1 decimal place
  }

  generatePrecipitation(latitude, longitude, month, day, year) {
    const dayOfYear = this.getDayOfYear(month, day);
    
    // Seasonal precipitation patterns (varies by region)
    let seasonalFactor = 1;
    
    // Simplified seasonal patterns
    if (Math.abs(latitude) < 30) {
      // Tropical: wet/dry seasons
      seasonalFactor = Math.abs(Math.sin(2 * Math.PI * dayOfYear / 365)) + 0.3;
    } else {
      // Temperate: winter precipitation in many regions
      const isWinter = (latitude > 0 && (month <= 3 || month >= 11)) || 
                      (latitude < 0 && (month >= 5 && month <= 9));
      seasonalFactor = isWinter ? 1.5 : 0.7;
    }
    
    // Base precipitation rate (mm/day)
    const basePrecip = 2 + Math.abs(Math.sin(latitude * Math.PI / 180)) * 3;
    
    // Most days have little to no precipitation
    const precipProb = 0.3; // 30% chance of precipitation
    
    if (Math.random() > precipProb) {
      return 0; // No precipitation
    }
    
    // When it does precipitate, use exponential distribution
    const intensity = -Math.log(Math.random()) * basePrecip * seasonalFactor;
    
    return Math.round(intensity * 10) / 10;
  }

  generateWindSpeed(latitude, longitude, month, day, year) {
    // Base wind speed (higher at higher latitudes and coastal areas)
    const latitudeEffect = Math.abs(latitude) / 90; // 0 to 1
    const baseWind = 3 + latitudeEffect * 7; // 3-10 m/s base
    
    // Seasonal variation (windier in winter for many locations)
    const dayOfYear = this.getDayOfYear(month, day);
    const seasonalPeak = latitude > 0 ? 15 : 195; // January vs July
    const seasonalVariation = Math.cos(2 * Math.PI * (dayOfYear - seasonalPeak) / 365);
    const seasonalWind = baseWind + seasonalVariation * 3;
    
    // Random daily variation
    const randomFactor = 0.5 + Math.random(); // 0.5 to 1.5 multiplier
    
    return Math.round(seasonalWind * randomFactor * 10) / 10;
  }

  generateHeatIndex(latitude, month, day, year) {
    // Heat index is a combination of temperature and humidity
    const temp = this.generateTemperature('max', latitude, month, day, year);
    
    // Mock humidity based on location and season
    const baseHumidity = 50 + Math.abs(Math.sin(latitude * Math.PI / 180)) * 30;
    const humidity = baseHumidity + (Math.random() - 0.5) * 20;
    
    // Simplified heat index calculation
    let heatIndex = temp;
    if (temp > 26 && humidity > 40) {
      // Heat index becomes significant at higher temp/humidity
      const humidityEffect = (humidity - 40) / 60; // 0 to 1
      heatIndex = temp + humidityEffect * 10;
    }
    
    return Math.round(heatIndex * 10) / 10;
  }

  generateAirQuality(latitude, longitude, month, day, year) {
    // AOD (Aerosol Optical Depth) values typically range from 0 to 1+
    
    // Base AOD (higher near industrial areas, represented by latitude proximity to major cities)
    let baseAOD = 0.1;
    
    // Seasonal variation (often higher in certain seasons due to fires, dust, etc.)
    const dayOfYear = this.getDayOfYear(month, day);
    const seasonalVariation = Math.sin(2 * Math.PI * dayOfYear / 365) * 0.1;
    
    // Random daily variation
    const dailyVariation = Math.random() * 0.3;
    
    // Occasional high pollution events
    const isHighPollutionEvent = Math.random() < 0.05; // 5% chance
    const pollutionSpike = isHighPollutionEvent ? Math.random() * 0.8 : 0;
    
    const aod = baseAOD + seasonalVariation + dailyVariation + pollutionSpike;
    
    return Math.round(Math.max(0, aod) * 1000) / 1000; // Round to 3 decimal places
  }

  getDayOfYear(month, day) {
    const date = new Date(2024, month - 1, day); // Use non-leap year for consistency
    const start = new Date(2024, 0, 1);
    return Math.floor((date - start) / (24 * 60 * 60 * 1000)) + 1;
  }

  getDataSource(variable) {
    const sources = {
      max_temp: 'MERRA-2 Reanalysis',
      min_temp: 'MERRA-2 Reanalysis',
      precipitation: 'GPM/TRMM Multi-satellite',
      wind_speed: 'MERRA-2 Reanalysis',
      heat_index: 'MERRA-2 Derived',
      air_quality: 'MODIS Terra/Aqua'
    };
    
    return sources[variable] || 'NASA Earth Observation';
  }
}

// Export singleton instance
const nasaDataService = new NASADataService();

module.exports = {
  processHistoricalAnalysis: (params) => nasaDataService.processHistoricalAnalysis(params),
  NASADataService
};