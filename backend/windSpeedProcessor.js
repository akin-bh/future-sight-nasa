const fs = require('fs');
const path = require('path');

class WindSpeedProcessor {
  constructor() {
    this.windSpeedData = new Map(); // Date -> Array of readings
    this.isDataLoaded = false;
    this.totalRecords = 0;
    this.dateRange = { start: null, end: null };
  }

  async loadWindSpeedData() {
    const filePath = path.join(__dirname, '../data/Wind Data 2015-2025.csv');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Wind speed data file not found');
    }

    console.log('📊 Loading wind speed data...');
    
    return new Promise((resolve, reject) => {
      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      let headerLineIndex = -1;
      
      // Find the line with time and Wind columns (exact format)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('time,') && line.includes('Wind')) {
          headerLineIndex = i;
          break;
        }
      }
      
      if (headerLineIndex === -1) {
        reject(new Error('Could not find data header in wind speed file'));
        return;
      }
      
      console.log(`📊 Found wind speed data header at line ${headerLineIndex + 1}`);
      
      // Process data lines starting from header + 1
      const header = lines[headerLineIndex].split(',').map(col => col.trim());
      const timeColIndex = header.findIndex(col => col.toLowerCase().includes('time'));
      const windColIndex = header.findIndex(col => col.includes('Wind'));
      
      if (timeColIndex === -1 || windColIndex === -1) {
        reject(new Error('Could not find time or wind speed columns'));
        return;
      }
      
      for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',').map(col => col.trim());
        if (columns.length < Math.max(timeColIndex, windColIndex) + 1) continue;
        
        const timestamp = columns[timeColIndex];
        const windValue = parseFloat(columns[windColIndex]);
        
        if (timestamp && !isNaN(windValue) && windValue !== -9999) {
          // Wind speed is already in m/s (no conversion needed)
          const windSpeedMs = windValue;
          
          const date = timestamp.split(' ')[0]; // Get date part
          const time = timestamp.split(' ')[1]; // Get time part
          
          if (!this.windSpeedData.has(date)) {
            this.windSpeedData.set(date, []);
          }
          
          this.windSpeedData.get(date).push({
            time: time,
            value: windSpeedMs,
            raw: windValue
          });
          
          this.totalRecords++;
        }
      }
      
      const dates = Array.from(this.windSpeedData.keys()).sort();
      if (dates.length > 0) {
        this.dateRange.start = dates[0];
        this.dateRange.end = dates[dates.length - 1];
      }
      
      this.isDataLoaded = true;
      console.log(`✅ Loaded wind speed data for ${this.windSpeedData.size} days`);
      console.log(`📈 Total wind speed records: ${this.totalRecords}`);
      resolve();
    });
  }

  getWindSpeedForDate(date) {
    if (!this.isDataLoaded) {
      throw new Error('Wind speed data not loaded');
    }

    const readings = this.windSpeedData.get(date);
    if (!readings || readings.length === 0) {
      return null;
    }

    // Calculate daily statistics
    const values = readings.map(r => r.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Wind speed categories (Beaufort scale approximation)
    let windCategory = 'Calm';
    if (average >= 0.3 && average < 1.6) windCategory = 'Light Air';
    else if (average >= 1.6 && average < 3.4) windCategory = 'Light Breeze';
    else if (average >= 3.4 && average < 5.5) windCategory = 'Gentle Breeze';
    else if (average >= 5.5 && average < 8.0) windCategory = 'Moderate Breeze';
    else if (average >= 8.0 && average < 10.8) windCategory = 'Fresh Breeze';
    else if (average >= 10.8 && average < 13.9) windCategory = 'Strong Breeze';
    else if (average >= 13.9 && average < 17.2) windCategory = 'Near Gale';
    else if (average >= 17.2 && average < 20.8) windCategory = 'Gale';
    else if (average >= 20.8) windCategory = 'Strong Gale+';

    return {
      date,
      readings: readings.length,
      average_wind_speed_ms: average,
      max_wind_speed_ms: max,
      min_wind_speed_ms: min,
      wind_category: windCategory,
      data_source: 'NASA GLDAS Model - Near surface wind speed 3-hourly 0.25 deg',
      unit: 'm/s',
      raw_readings: readings
    };
  }

  getWindSpeedRange(startDate, endDate) {
    if (!this.isDataLoaded) {
      throw new Error('Wind speed data not loaded');
    }

    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = this.getWindSpeedForDate(dateStr);
      if (dayData) {
        result.push(dayData);
      }
    }

    return result;
  }

  getMonthlyStatistics(year, month) {
    if (!this.isDataLoaded) {
      throw new Error('Wind speed data not loaded');
    }

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();
    
    const monthlyData = [];
    Array.from(this.windSpeedData.keys())
      .filter(date => date.startsWith(`${yearStr}-${monthStr}`))
      .forEach(date => {
        const dayData = this.getWindSpeedForDate(date);
        if (dayData) {
          monthlyData.push(dayData);
        }
      });

    if (monthlyData.length === 0) {
      return null;
    }

    const avgWindSpeed = monthlyData.reduce((sum, day) => sum + day.average_wind_speed_ms, 0) / monthlyData.length;
    const maxWindSpeed = Math.max(...monthlyData.map(day => day.max_wind_speed_ms));
    const windyDays = monthlyData.filter(day => day.average_wind_speed_ms > 5.5).length; // Above gentle breeze

    return {
      year,
      month,
      days_with_data: monthlyData.length,
      average_monthly_wind_speed_ms: avgWindSpeed,
      max_monthly_wind_speed_ms: maxWindSpeed,
      windy_days: windyDays,
      data_source: 'NASA GLDAS Model'
    };
  }

  getDataSummary() {
    return {
      dataLoaded: this.isDataLoaded,
      totalDays: this.windSpeedData.size,
      totalRecords: this.totalRecords,
      dateRange: this.dateRange,
      source: 'NASA GLDAS Model - Near surface wind speed 3-hourly 0.25 deg',
      unit: 'm/s'
    };
  }

  // Get seasonal wind speed pattern for fallback data
  getSeasonalWindSpeed(month) {
    // Seasonal wind speed patterns (m/s) - typical global average
    const patterns = {
      1: 4.8,   // Winter - higher wind speeds
      2: 4.6,
      3: 4.4,   // Spring - moderate winds
      4: 4.1,
      5: 3.8,   // Late spring
      6: 3.5,   // Early summer - calmer
      7: 3.3,   // Summer - lowest winds
      8: 3.4,
      9: 3.7,   // Fall - increasing winds
      10: 4.0,
      11: 4.3,  // Late fall
      12: 4.6   // Winter
    };
    return patterns[month] || 4.0;
  }
}

module.exports = WindSpeedProcessor;