const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class PrecipitationProcessor {
  constructor() {
    this.precipitationData = new Map(); // Date -> Array of readings
    this.isDataLoaded = false;
    this.totalRecords = 0;
    this.dateRange = { start: null, end: null };
  }

  async loadPrecipitationData() {
    const filePath = path.join(__dirname, '../data/Precipitation Data 2015-2025.csv');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Precipitation data file not found');
    }

    console.log('📊 Loading precipitation data...');
    
    return new Promise((resolve, reject) => {
      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      let headerLineIndex = -1;
      
      // Find the line with time and Rainf columns (exact format)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('time,') && line.includes('Rainf')) {
          headerLineIndex = i;
          break;
        }
      }
      
      if (headerLineIndex === -1) {
        reject(new Error('Could not find data header in precipitation file'));
        return;
      }
      
      console.log(`📊 Found precipitation data header at line ${headerLineIndex + 1}`);
      
      // Process data lines starting from header + 1
      const header = lines[headerLineIndex].split(',').map(col => col.trim());
      const timeColIndex = header.findIndex(col => col.toLowerCase().includes('time'));
      const precipColIndex = header.findIndex(col => col.includes('Rainf'));
      
      if (timeColIndex === -1 || precipColIndex === -1) {
        reject(new Error('Could not find time or precipitation columns'));
        return;
      }
      
      for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',').map(col => col.trim());
        if (columns.length < Math.max(timeColIndex, precipColIndex) + 1) continue;
        
        const timestamp = columns[timeColIndex];
        const precipValue = parseFloat(columns[precipColIndex]);
        
        if (timestamp && !isNaN(precipValue) && precipValue !== -9999) {
          // Convert to mm/hour (GLDAS gives kg/m²/s, multiply by 3600 to get mm/hour)
          const precipMmHour = precipValue * 3600;
          
          const date = timestamp.split(' ')[0]; // Get date part
          const time = timestamp.split(' ')[1]; // Get time part
          
          if (!this.precipitationData.has(date)) {
            this.precipitationData.set(date, []);
          }
          
          this.precipitationData.get(date).push({
            time: time,
            value: precipMmHour,
            raw: precipValue
          });
          
          this.totalRecords++;
        }
      }
      
      const dates = Array.from(this.precipitationData.keys()).sort();
      if (dates.length > 0) {
        this.dateRange.start = dates[0];
        this.dateRange.end = dates[dates.length - 1];
      }
      
      this.isDataLoaded = true;
      console.log(`✅ Loaded precipitation data for ${this.precipitationData.size} days`);
      console.log(`📈 Total precipitation records: ${this.totalRecords}`);
      resolve();
    });
  }

  getPrecipitationForDate(date) {
    if (!this.isDataLoaded) {
      throw new Error('Precipitation data not loaded');
    }

    const readings = this.precipitationData.get(date);
    if (!readings || readings.length === 0) {
      return null;
    }

    // Calculate daily statistics
    const values = readings.map(r => r.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      date,
      readings: readings.length,
      daily_total_mm: total * 3, // Convert hourly to 3-hourly total
      average_mm_per_hour: average,
      max_mm_per_hour: max,
      min_mm_per_hour: min,
      data_source: 'NASA GLDAS Model - Total precipitation rate 3-hourly 0.25 deg',
      unit: 'mm/hour',
      raw_readings: readings
    };
  }

  getPrecipitationRange(startDate, endDate) {
    if (!this.isDataLoaded) {
      throw new Error('Precipitation data not loaded');
    }

    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = this.getPrecipitationForDate(dateStr);
      if (dayData) {
        result.push(dayData);
      }
    }

    return result;
  }

  getMonthlyStatistics(year, month) {
    if (!this.isDataLoaded) {
      throw new Error('Precipitation data not loaded');
    }

    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString();
    
    const monthlyData = [];
    Array.from(this.precipitationData.keys())
      .filter(date => date.startsWith(`${yearStr}-${monthStr}`))
      .forEach(date => {
        const dayData = this.getPrecipitationForDate(date);
        if (dayData) {
          monthlyData.push(dayData);
        }
      });

    if (monthlyData.length === 0) {
      return null;
    }

    const totalPrecip = monthlyData.reduce((sum, day) => sum + day.daily_total_mm, 0);
    const avgDaily = totalPrecip / monthlyData.length;
    const maxDaily = Math.max(...monthlyData.map(day => day.daily_total_mm));
    const rainyDays = monthlyData.filter(day => day.daily_total_mm > 0.1).length;

    return {
      year,
      month,
      days_with_data: monthlyData.length,
      total_monthly_precipitation_mm: totalPrecip,
      average_daily_precipitation_mm: avgDaily,
      max_daily_precipitation_mm: maxDaily,
      rainy_days: rainyDays,
      data_source: 'NASA GLDAS Model'
    };
  }

  getDataSummary() {
    return {
      dataLoaded: this.isDataLoaded,
      totalDays: this.precipitationData.size,
      totalRecords: this.totalRecords,
      dateRange: this.dateRange,
      source: 'NASA GLDAS Model - Total precipitation rate 3-hourly 0.25 deg',
      unit: 'mm/hour'
    };
  }

  // Get seasonal precipitation pattern for fallback data
  getSeasonalPrecipitation(month) {
    // Seasonal precipitation patterns (mm/day)
    const patterns = {
      1: 2.1,   // Winter - lower precipitation
      2: 2.3,
      3: 3.2,   // Spring - increasing
      4: 3.8,
      5: 4.5,   // Late spring
      6: 5.2,   // Early summer
      7: 4.8,   // Summer - variable
      8: 4.3,
      9: 3.9,   // Fall - decreasing
      10: 3.1,
      11: 2.7,  // Late fall
      12: 2.2   // Winter
    };
    return patterns[month] || 3.0;
  }
}

module.exports = PrecipitationProcessor;