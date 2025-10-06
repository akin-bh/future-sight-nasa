import React, { useState, useEffect } from 'react';

const WEATHER_VARIABLES = [
  {
    id: 'max_temp',
    name: 'Max Temperature',
    unit: '°C',
    condition: 'Very Hot',
    operator: '≥',
    defaultThreshold: 35,
    description: 'Maximum daily temperature'
  },
  {
    id: 'min_temp',
    name: 'Min Temperature',
    unit: '°C',
    condition: 'Very Cold',
    operator: '≤',
    defaultThreshold: 0,
    description: 'Minimum daily temperature'
  },
  {
    id: 'humidity',
    name: 'Humidity',
    unit: 'kg/kg',
    condition: 'Very Humid',
    operator: '≥',
    defaultThreshold: 0.015,
    description: 'Specific humidity from NASA GLDAS Model'
  },
  {
    id: 'precipitation',
    name: 'Total Precipitation',
    unit: 'mm',
    condition: 'Very Wet',
    operator: '≥',
    defaultThreshold: 10,
    description: 'Daily precipitation amount'
  },
  {
    id: 'wind_speed',
    name: 'Wind Speed',
    unit: 'm/s',
    condition: 'Very Windy',
    operator: '≥',
    defaultThreshold: 8.0,
    description: 'Near surface wind speed from NASA GLDAS Model'
  }
];

function QueryInputModule({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    location: '',
    month: '',
    day: '',
    year: '',
    variable: '',
    threshold: ''
  });

  const [availableCities, setAvailableCities] = useState({});
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load available cities on component mount
  useEffect(() => {
    const fetchAvailableCities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/available-cities');
        const data = await response.json();
        
        // Ensure data.cities is a valid object
        if (data && data.cities && typeof data.cities === 'object') {
          setAvailableCities(data.cities);
          
          // Set default city if none selected
          if (!formData.location && Object.keys(data.cities).length > 0) {
            setFormData(prev => ({ ...prev, location: Object.keys(data.cities)[0] }));
          }
        } else {
          throw new Error('Invalid cities data structure');
        }
      } catch (error) {
        console.error('Failed to load available cities:', error);
        // Fallback cities if API fails
        const fallbackCities = {
          'New York': { lat: 40.7, lon: -74.0, state: 'NY' },
          'Chicago': { lat: 41.9, lon: -87.6, state: 'IL' },
          'Los Angeles': { lat: 34.1, lon: -118.2, state: 'CA' }
        };
        setAvailableCities(fallbackCities);
        setFormData(prev => ({ ...prev, location: 'New York' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableCities();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariableChange = (variableId) => {
    const variable = WEATHER_VARIABLES.find(v => v.id === variableId);
    setSelectedVariable(variable);
    setFormData(prev => ({
      ...prev,
      variable: variableId,
      threshold: variable ? variable.defaultThreshold.toString() : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.location) {
      alert('Please select a city');
      return;
    }
    
    if (!formData.month || !formData.day) {
      alert('Please select a date (month and day)');
      return;
    }
    
    if (!formData.variable || !formData.threshold) {
      alert('Please select a weather variable and threshold');
      return;
    }

    // Submit with selected city and parameters
    const params = {
      location: typeof formData.location === 'string' ? formData.location : String(formData.location),
      month: parseInt(formData.month),
      day: parseInt(formData.day),
      year: formData.year ? parseInt(formData.year) : undefined,
      variable: formData.variable,
      threshold: parseFloat(formData.threshold),
      variableInfo: selectedVariable
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    onSubmit(params);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Query Parameters
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Configure your weather risk analysis
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              US City (NASA NLDAS Coverage)
            </span>
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            disabled={isLoading}
          >
            <option value="">{isLoading ? 'Loading cities...' : 'Select a city'}</option>
            {!isLoading && Object.entries(availableCities).map(([cityName, cityData]) => {
              // Safety check for cityData structure
              if (!cityData || typeof cityData !== 'object') {
                console.warn('Invalid city data for:', cityName, cityData);
                return null;
              }
              
              const lat = cityData.lat || 0;
              const lon = cityData.lon || 0;
              const state = cityData.state || '';
              
              return (
                <option key={cityName} value={cityName}>
                  {cityName}{state ? `, ${state}` : ''} ({lat.toFixed(1)}°, {lon.toFixed(1)}°)
                </option>
              );
            }).filter(Boolean)}
          </select>
          <p className="text-xs text-gray-500">
            🛰️ Real temperature data from NASA NLDAS Giovanni covering North America
          </p>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date Selection
            </span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <select
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            
            <select
              value={formData.day}
              onChange={(e) => handleInputChange('day', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <select
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Year (Optional)</option>
              {Array.from({ length: 45 }, (_, i) => {
                const year = 2030 - i;
                return (
                  <option key={year} value={year}>
                    {year} {year > 2025 ? '🔮 Prediction' : '📊 Historical'}
                  </option>
                );
              })}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            � Select a future year for weather prediction or past year for historical analysis. Leave blank for probability patterns.
          </p>
        </div>

        {/* Variable Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
              </svg>
              Weather Variable
            </span>
          </label>
          <select
            value={formData.variable}
            onChange={(e) => handleVariableChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">Select a variable</option>
            {WEATHER_VARIABLES.map(variable => (
              <option key={variable.id} value={variable.id}>
                {variable.name} ({variable.unit})
              </option>
            ))}
          </select>
          
          {selectedVariable && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">
                <strong>Condition:</strong> {selectedVariable.condition}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedVariable.description}
              </p>
            </div>
          )}
        </div>

        {/* Threshold Definition */}
        {selectedVariable && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Adverse Threshold
              </span>
            </label>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 font-medium text-lg">{selectedVariable.operator}</span>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => handleInputChange('threshold', e.target.value)}
                step="any"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <span className="text-gray-600 font-medium">{selectedVariable.unit}</span>
            </div>
            <p className="text-sm text-gray-500">
              Define what constitutes "{selectedVariable.condition}" for your activity
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </div>
          ) : (
            'Calculate Likelihood'
          )}
        </button>
      </form>
      </div>
    </div>
  );
}

export default QueryInputModule;