# Future Sight: Weather Prediction & Historical Analysis

A modern web application that provides weather risk prediction and historical analysis using real NASA satellite data.

## Overview

Future Sight analyzes weather patterns using NASA Earth Observation data to help users understand future weather conditions and historical probability of specific weather events for any location and date.

## Features

- **Location-based Analysis**: Enter city name or coordinates
- **Date-specific Queries**: Select any day of the year
- **Multiple Weather Variables**: Temperature, humidity, precipitation, wind speed
- **Custom Thresholds**: Define personal risk tolerance levels
- **Statistical Analysis**: Historical probability and trend calculations
- **Data Visualization**: Interactive charts and distribution graphs

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js/Express API
- **Data Sources**: NASA AIRS (temperature), NASA GLDAS (humidity, precipitation, wind)
- **Visualization**: Chart.js
- **Data Processing**: Custom NASA data processors

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 to view the application

## Project Structure

```
NASA/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   └── package.json
├── backend/               # Node.js API server
│   ├── index.js          # Main server file
│   ├── *Processor.js     # NASA data processors
│   └── package.json
├── data/                 # NASA satellite data files
└── docs/                 # API documentation
```

## Data Sources

This application uses authentic NASA satellite data:

- **Temperature**: NASA AIRS/Aqua L3 Monthly Standard Physical Retrieval
- **Humidity**: NASA GLDAS Noah Land Surface Model (Specific Humidity)
- **Precipitation**: NASA GLDAS Noah Land Surface Model (Precipitation Rate)  
- **Wind Speed**: NASA GLDAS Noah Land Surface Model (Near Surface Wind Speed)

All data accessed through NASA Giovanni interface with 10+ years coverage (2015-2025).

## NASA Data Access

- [NASA Earthdata](https://earthdata.nasa.gov/) - Main data portal
- [Giovanni Interface](https://giovanni.gsfc.nasa.gov/) - Data analysis tool
- [AIRS Mission](https://airs.jpl.nasa.gov/) - Temperature data source
- [GLDAS Project](https://ldas.gsfc.nasa.gov/gldas/) - Land surface data
