# API Documentation

## Overview

The Future Sight Weather API provides endpoints for weather risk analysis using NASA satellite data.

## Data Sources

This API integrates data from:
- **AIRS (Temperature)**: NASA AIRS/Aqua L3 Monthly Standard Physical Retrieval
- **GLDAS (Humidity/Precipitation/Wind)**: NASA GLDAS Noah Land Surface Model

## Base URL

Development: `http://localhost:3001/api`

## Authentication

Currently no authentication required.

## Endpoints

### POST /historical-analysis

Performs weather risk analysis for a given location and parameters.

**Request Body:**
```json
{
  "location": "New York, NY",           // OR use coordinates
  "latitude": 40.7128,                  // Alternative to location
  "longitude": -74.0060,                // Required with latitude
  "month": 7,                           // 1-12
  "day": 15,                           // 1-31
  "variable": "max_temp",              // See variable types below
  "threshold": 35,                     // Adverse condition threshold
  "variableInfo": {                    // Optional metadata
    "name": "Max Temperature",
    "unit": "°C",
    "condition": "Very Hot",
    "operator": "≥"
  }
}
```

**Variable Types:**
- `max_temp`: Maximum temperature (°C)
- `min_temp`: Minimum temperature (°C)  
- `precipitation`: Total precipitation (mm)
- `wind_speed`: Maximum wind speed (m/s)
- `heat_index`: Heat comfort index
- `air_quality`: Aerosol Optical Depth (AOD)

**Response:**
```json
{
  "probability": 23.5,                 // Percentage likelihood
  "historicalMean": 32.1,              // Historical average
  "trendChange": 2.3,                  // Trend change (%)
  "trendAnalysis": "Probability has increased...",
  "dataYears": 34,                     // Years of data
  "distributionData": {
    "bins": [...],                     // Histogram bins
    "frequencies": [...]               // Frequency counts
  },
  "dataSources": [...],                // NASA data sources
  "metadata": {
    "processedAt": "2024-01-01T00:00:00Z",
    "coordinates": {...},
    "queryParameters": {...}
  }
}
```

### POST /geocode

Converts location names to coordinates.

**Request Body:**
```json
{
  "location": "San Francisco, CA"
}
```

**Response:**
```json
{
  "location": "San Francisco, CA",
  "coordinates": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "source": "geocoding-service"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "weather-risk-api"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Common Error Codes:**
- `400`: Validation Error - Invalid request parameters
- `404`: Not Found - Location not found or endpoint doesn't exist
- `500`: Internal Server Error - Processing failed

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Data Sources

The API integrates with NASA Earth Observation datasets:

1. **MERRA-2**: Temperature and wind data
2. **GPM/TRMM**: Precipitation data  
3. **MODIS**: Air quality (AOD) data
4. **Derived Products**: Heat index calculations

## Statistical Calculations

### Historical Probability

```
P = (Number of adverse days / Total days) × 100
```

Where "adverse" is defined by the user's threshold and variable operator.

### Trend Analysis

Compares early period vs recent period probabilities to determine if conditions are becoming more/less likely over time.

### Distribution Data

Creates histogram bins for visualization, with adverse conditions highlighted.

## Integration Examples

### JavaScript/React

```javascript
const response = await fetch('/api/historical-analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    location: 'Miami, FL',
    month: 8,
    day: 15,
    variable: 'max_temp',
    threshold: 35
  })
});

const data = await response.json();
console.log(`Risk probability: ${data.probability}%`);
```

### Python

```python
import requests

response = requests.post('http://localhost:3001/api/historical-analysis', 
  json={
    'latitude': 25.7617,
    'longitude': -80.1918,
    'month': 8,
    'day': 15,
    'variable': 'max_temp',
    'threshold': 35
  }
)

data = response.json()
print(f"Risk probability: {data['probability']}%")
```

## Caching

Results are cached for 1 hour to improve performance. Cache keys are based on query parameters.

## Future Enhancements

- Real-time NASA API integration
- User authentication and API keys
- Historical data export in additional formats
- Advanced statistical models
- Machine learning predictions