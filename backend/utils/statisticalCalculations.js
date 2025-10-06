/**
 * Statistical Calculations for Historical Weather Risk Analysis
 * Implements the core statistical logic required by the specification
 */

/**
 * Calculate comprehensive statistics for historical weather data
 */
function calculateStatistics(historicalData, threshold, variable) {
  const { data } = historicalData;
  
  if (!data || data.length === 0) {
    throw new Error('No historical data available for analysis');
  }

  const values = data.map(record => record.value);
  const years = data.map(record => record.year);
  
  // Core calculations
  const probability = calculateProbability(values, threshold, variable);
  const mean = calculateMean(values);
  const trendAnalysis = calculateTrendAnalysis(data, threshold, variable);
  const distributionData = createDistributionData(values, threshold, variable);
  
  return {
    probability: Math.round(probability * 100) / 100, // Round to 2 decimal places
    mean: Math.round(mean * 100) / 100,
    trendChange: Math.round(trendAnalysis.trendChange * 100) / 100,
    trendAnalysis: trendAnalysis.description,
    dataYears: years.length,
    distributionData,
    rawData: {
      values,
      years,
      recordCount: data.length
    }
  };
}

/**
 * Calculate the historical probability of adverse conditions
 * This is the core calculation as specified in the requirements
 */
function calculateProbability(values, threshold, variable) {
  if (values.length === 0) return 0;
  
  let adverseCount = 0;
  
  values.forEach(value => {
    const isAdverse = checkAdverseCondition(value, threshold, variable);
    if (isAdverse) {
      adverseCount++;
    }
  });
  
  return (adverseCount / values.length) * 100; // Return as percentage
}

/**
 * Check if a value meets the adverse condition criteria
 */
function checkAdverseCondition(value, threshold, variable) {
  // Define operators for each variable type
  const operators = {
    'max_temp': '>=',     // Very Hot: >= threshold
    'min_temp': '<=',     // Very Cold: <= threshold
    'precipitation': '>=', // Very Wet: >= threshold
    'wind_speed': '>=',   // Very Windy: >= threshold
    'heat_index': '>=',   // Very Uncomfortable: >= threshold
    'air_quality': '>='   // Poor Air Quality: >= threshold
  };
  
  const operator = operators[variable];
  
  switch (operator) {
    case '>=':
      return value >= threshold;
    case '<=':
      return value <= threshold;
    default:
      throw new Error(`Unknown operator for variable: ${variable}`);
  }
}

/**
 * Calculate the historical mean for the selected date
 */
function calculateMean(values) {
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

/**
 * Calculate trend analysis over the data period
 * Determines if adverse conditions are becoming more or less likely
 */
function calculateTrendAnalysis(data, threshold, variable) {
  if (data.length < 10) {
    return {
      trendChange: 0,
      description: 'Insufficient data for trend analysis'
    };
  }
  
  // Split data into early and recent periods
  const sortedData = data.sort((a, b) => a.year - b.year);
  const splitPoint = Math.floor(sortedData.length / 2);
  
  const earlyPeriod = sortedData.slice(0, splitPoint);
  const recentPeriod = sortedData.slice(splitPoint);
  
  // Calculate probability for each period
  const earlyValues = earlyPeriod.map(d => d.value);
  const recentValues = recentPeriod.map(d => d.value);
  
  const earlyProbability = calculateProbability(earlyValues, threshold, variable);
  const recentProbability = calculateProbability(recentValues, threshold, variable);
  
  const trendChange = recentProbability - earlyProbability;
  
  // Generate descriptive analysis
  let description;
  const earlyYears = `${earlyPeriod[0].year}-${earlyPeriod[earlyPeriod.length - 1].year}`;
  const recentYears = `${recentPeriod[0].year}-${recentPeriod[recentPeriod.length - 1].year}`;
  
  if (Math.abs(trendChange) < 2) {
    description = `Probability has remained relatively stable over the last ${data.length} years (${earlyYears}: ${earlyProbability.toFixed(1)}%, ${recentYears}: ${recentProbability.toFixed(1)}%).`;
  } else if (trendChange > 0) {
    description = `Probability has increased by ${trendChange.toFixed(1)} percentage points over the last ${data.length} years (from ${earlyProbability.toFixed(1)}% in ${earlyYears} to ${recentProbability.toFixed(1)}% in ${recentYears}).`;
  } else {
    description = `Probability has decreased by ${Math.abs(trendChange).toFixed(1)} percentage points over the last ${data.length} years (from ${earlyProbability.toFixed(1)}% in ${earlyYears} to ${recentProbability.toFixed(1)}% in ${recentYears}).`;
  }
  
  return {
    trendChange,
    description,
    earlyProbability,
    recentProbability,
    earlyPeriod: earlyYears,
    recentPeriod: recentYears
  };
}

/**
 * Create distribution data for histogram visualization
 * As specified in the requirements for the Distribution Chart
 */
function createDistributionData(values, threshold, variable) {
  if (values.length === 0) {
    return { bins: [], frequencies: [] };
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // Create appropriate number of bins (typically 10-20 for good visualization)
  const numBins = Math.min(20, Math.max(10, Math.floor(values.length / 5)));
  const binWidth = range / numBins;
  
  // Create bins
  const bins = [];
  const frequencies = [];
  
  for (let i = 0; i < numBins; i++) {
    const binMin = min + (i * binWidth);
    const binMax = min + ((i + 1) * binWidth);
    
    bins.push({
      min: binMin,
      max: binMax,
      midpoint: (binMin + binMax) / 2
    });
    
    // Count values in this bin
    const count = values.filter(value => {
      if (i === numBins - 1) {
        // Last bin includes the maximum value
        return value >= binMin && value <= binMax;
      } else {
        return value >= binMin && value < binMax;
      }
    }).length;
    
    frequencies.push(count);
  }
  
  return {
    bins,
    frequencies,
    metadata: {
      totalValues: values.length,
      range: { min, max },
      binWidth,
      threshold,
      variable
    }
  };
}

/**
 * Calculate additional statistical measures
 */
function calculateAdvancedStatistics(values) {
  if (values.length === 0) return {};
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  // Median
  const median = n % 2 === 0 
    ? (sorted[n/2 - 1] + sorted[n/2]) / 2
    : sorted[Math.floor(n/2)];
  
  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  
  // Standard deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    median: Math.round(median * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    range: {
      min: Math.min(...values),
      max: Math.max(...values)
    }
  };
}

/**
 * Validate input parameters for statistical calculations
 */
function validateStatisticalInputs(data, threshold, variable) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: must be a non-empty array');
  }
  
  if (typeof threshold !== 'number' || isNaN(threshold)) {
    throw new Error('Invalid threshold: must be a number');
  }
  
  const validVariables = ['max_temp', 'min_temp', 'precipitation', 'wind_speed', 'heat_index', 'air_quality'];
  if (!validVariables.includes(variable)) {
    throw new Error(`Invalid variable: must be one of ${validVariables.join(', ')}`);
  }
  
  // Check if data has required structure
  const hasValidStructure = data.every(record => 
    record && 
    typeof record.value === 'number' && 
    !isNaN(record.value) &&
    typeof record.year === 'number'
  );
  
  if (!hasValidStructure) {
    throw new Error('Invalid data structure: each record must have numeric value and year properties');
  }
}

module.exports = {
  calculateStatistics,
  calculateProbability,
  calculateMean,
  calculateTrendAnalysis,
  createDistributionData,
  calculateAdvancedStatistics,
  checkAdverseCondition,
  validateStatisticalInputs
};