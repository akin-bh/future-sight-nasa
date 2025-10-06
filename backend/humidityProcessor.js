const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class HumidityProcessor {
  constructor() {
    this.humidityData = new Map();
    this.dataLoaded = false;
  }

  async loadHumidityData() {
    try {
      const csvPath = path.join(__dirname, '..', 'data', 'Humidity Data 2015-2025.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.log('❌ Humidity data file not found:', csvPath);
        return false;
      }

      console.log('📊 Loading humidity data...');
      
      return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(csvPath)
          .pipe(csv({
            skipLinesWithError: true,
            skipEmptyLines: true,
            headers: false
          }))
          .on('data', (data) => {
            // Skip header and metadata lines
            const firstValue = Object.values(data)[0];
            if (firstValue && firstValue.includes('time')) {
              return; // Skip header row
            }
            
            if (firstValue && !firstValue.includes('Title:') && 
                !firstValue.includes('User') && 
                !firstValue.includes('Data') &&
                !firstValue.includes('URL') &&
                !firstValue.includes('Fill Value') &&
                firstValue.length > 8) { // Valid datetime string
              
              const values = Object.values(data);
              if (values.length >= 2) {
                const timestamp = values[0];
                const humidity = parseFloat(values[1]);
                
                if (!isNaN(humidity) && humidity > -9999) {
                  results.push({
                    timestamp: new Date(timestamp),
                    humidity: humidity
                  });
                }
              }
            }
          })
          .on('end', () => {
            // Process and organize data by date
            results.forEach(record => {
              const dateKey = record.timestamp.toISOString().split('T')[0];
              
              if (!this.humidityData.has(dateKey)) {
                this.humidityData.set(dateKey, []);
              }
              
              this.humidityData.get(dateKey).push({
                time: record.timestamp,
                humidity: record.humidity
              });
            });

            this.dataLoaded = true;
            console.log(`✅ Loaded humidity data for ${this.humidityData.size} days`);
            console.log(`📈 Total humidity records: ${results.length}`);
            resolve(true);
          })
          .on('error', (error) => {
            console.error('❌ Error loading humidity data:', error);
            reject(error);
          });
      });
      
    } catch (error) {
      console.error('❌ Error in loadHumidityData:', error);
      return false;
    }
  }

  getHumidityForDate(date) {
    if (!this.dataLoaded) {
      return null;
    }

    const dateKey = date.toISOString().split('T')[0];
    const dayData = this.humidityData.get(dateKey);
    
    if (!dayData || dayData.length === 0) {
      return null;
    }

    // Calculate daily statistics
    const humidityValues = dayData.map(record => record.humidity);
    const avgHumidity = humidityValues.reduce((sum, val) => sum + val, 0) / humidityValues.length;
    const maxHumidity = Math.max(...humidityValues);
    const minHumidity = Math.min(...humidityValues);

    return {
      date: dateKey,
      averageHumidity: avgHumidity,
      maxHumidity: maxHumidity,
      minHumidity: minHumidity,
      recordCount: dayData.length,
      unit: 'kg/kg', // Specific humidity unit
      source: 'NASA GLDAS Model'
    };
  }

  getHumidityRange(startDate, endDate) {
    if (!this.dataLoaded) {
      return [];
    }

    const results = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const humidityData = this.getHumidityForDate(new Date(date));
      if (humidityData) {
        results.push(humidityData);
      }
    }

    return results;
  }

  getMonthlyStatistics(year, month) {
    if (!this.dataLoaded) {
      return null;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    const monthData = this.getHumidityRange(startDate, endDate);
    
    if (monthData.length === 0) {
      return null;
    }

    const avgValues = monthData.map(d => d.averageHumidity);
    const maxValues = monthData.map(d => d.maxHumidity);
    const minValues = monthData.map(d => d.minHumidity);

    return {
      year,
      month,
      monthlyAverage: avgValues.reduce((sum, val) => sum + val, 0) / avgValues.length,
      monthlyMax: Math.max(...maxValues),
      monthlyMin: Math.min(...minValues),
      daysWithData: monthData.length,
      unit: 'kg/kg',
      source: 'NASA GLDAS Model'
    };
  }

  isDataLoaded() {
    return this.dataLoaded;
  }

  getDataSummary() {
    if (!this.dataLoaded) {
      return null;
    }

    const dates = Array.from(this.humidityData.keys()).sort();
    return {
      dataLoaded: this.dataLoaded,
      totalDays: this.humidityData.size,
      dateRange: {
        start: dates[0],
        end: dates[dates.length - 1]
      },
      source: 'NASA GLDAS Model - Specific Humidity 3-hourly 0.25 deg',
      unit: 'kg/kg'
    };
  }
}

module.exports = HumidityProcessor;