import React from 'react';
import DistributionChart from './DistributionChart';
import { downloadCSV, downloadJSON } from '../utils/exportUtils';

function ResultsPanel({ data, loading, error, queryParams }) {
  
  // Helper function to safely access data properties
  const getStatValue = (key) => {
    return data?.statistics?.[key] || data?.[key] || 0;
  };
  
  // Helper function to convert distribution data format for DistributionChart
  const getDistributionData = () => {
    const distributionData = data?.statistics?.distributionData || data?.distributionData;
    
    if (!distributionData || !Array.isArray(distributionData)) {
      return null;
    }
    
    // Check if data is already in the correct format (bins and frequencies)
    if (distributionData.bins && distributionData.frequencies) {
      return distributionData;
    }
    
    // Convert from fallback format to chart format
    const bins = distributionData.map(item => {
      if (item.range) {
        // Parse range like "1.0-2.0"
        const [min, max] = item.range.split('-').map(parseFloat);
        return { min, max };
      } else {
        // Use x value as center and estimate range
        const binWidth = distributionData.length > 1 ? 
          Math.abs(distributionData[1].x - distributionData[0].x) : 1;
        return { 
          min: item.x - binWidth/2, 
          max: item.x + binWidth/2 
        };
      }
    });
    
    const frequencies = distributionData.map(item => item.y);
    
    return { bins, frequencies };
  };
  
  const getAnalysisTitle = () => {
    if (data?.analysisType === 'future-prediction') {
      return '🔮 Weather Prediction Results';
    } else if (data?.analysisType === 'specific-year') {
      return '📊 Historical Analysis Results';
    } else {
      return '📈 Probability Analysis Results';
    }
  };

  const getAnalysisDescription = () => {
    if (data?.analysisType === 'future-prediction') {
      return 'AI-generated prediction based on historical patterns';
    } else if (data?.analysisType === 'specific-year') {
      return 'Historical data analysis for specific year';
    } else {
      return 'Historical probability analysis';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analysis Results
          </h2>
        </div>
        <div className="flex items-center justify-center h-64 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {queryParams?.year > new Date().getFullYear() ? 
                'Generating weather prediction using AI analysis...' : 
                'Analyzing historical weather patterns...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analysis Results
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analysis Results
          </h2>
          <p className="text-green-100 text-sm mt-1">
            Your weather risk analysis will appear here
          </p>
        </div>
        <div className="text-center text-gray-500 py-16 px-6">
          <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Analysis</h3>
          <p className="text-gray-600">
            Configure your parameters and click "Calculate Likelihood" to get weather risk analysis 
            or future predictions based on NASA Earth Observation data and AI modeling.
          </p>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    downloadCSV(data, queryParams);
  };

  const handleExportJSON = () => {
    downloadJSON(data, queryParams);
  };

  return (
    <div className="space-y-6">
      {/* Primary Results Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {getAnalysisTitle()}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {getAnalysisDescription()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 text-sm bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Query Summary */}
          {queryParams && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Query Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-900"> {
                    queryParams.location || `${queryParams.latitude}, ${queryParams.longitude}`
                  }</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-900"> {
                    new Date(2024, queryParams.month - 1, queryParams.day).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  }</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Variable:</span>
                  <span className="ml-2 text-gray-900"> {queryParams.variableInfo?.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-600">Threshold:</span>
                  <span className="ml-2 text-gray-900"> {
                    queryParams.variableInfo?.operator
                  } {queryParams.threshold} {queryParams.variableInfo?.unit}</span>
                </div>
              </div>
            </div>
          )}

          {/* NASA Data Source Indicator */}
          {data.metadata && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                🛰️ NASA Earth Observation Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div><strong>Source:</strong> {data.metadata.dataSource}</div>
                <div><strong>Satellite:</strong> {data.metadata.satellite || 'NASA NLDAS'}</div>
                <div><strong>Base Temperature:</strong> {data.metadata.baseTemperature}</div>
                <div><strong>Location:</strong> {
                  typeof data.metadata.coordinates === 'string' 
                    ? data.metadata.coordinates 
                    : data.metadata.coordinates 
                      ? `${data.metadata.coordinates.lat || 0}°N, ${Math.abs(data.metadata.coordinates.lon || 0)}°W`
                      : 'Unknown'
                }</div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                ✨ Real NetCDF temperature data extracted from NASA Giovanni NLDAS dataset
              </div>
            </div>
          )}

          {/* Prediction Confidence (only for future predictions) */}
          {data?.analysisType === 'future-prediction' && (data?.predictionConfidence || data?.statistics?.confidence) && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Prediction Confidence
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(((data.predictionConfidence || data.statistics?.confidence || 0.75) * 100))}%` }}
                    ></div>
                  </div>
                </div>
                <span className="ml-3 text-purple-700 font-semibold">
                  {Math.round(((data.predictionConfidence || data.statistics?.confidence || 0.75) * 100))}%
                </span>
              </div>
              <p className="text-purple-600 text-xs mt-2">
                Based on {getStatValue('dataYears') || 30}+ years of historical NASA data patterns
              </p>
            </div>
          )}

          {/* Key Statistics */}
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {(() => {
                  const probability = getStatValue('probability') || 0;
                  // Check if probability is already a percentage (>1) or a decimal (0-1)
                  return Math.round(probability > 1 ? probability : probability * 100);
                })()}%
              </div>
              <div className="text-sm font-medium text-blue-800">
                Historical Probability
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Likelihood of occurrence
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(() => {
                  const avgValue = getStatValue('average');
                  if (avgValue === null || avgValue === undefined || isNaN(avgValue)) {
                    return 'N/A';
                  }
                  return avgValue.toFixed(1);
                })()}
              </div>
              <div className="text-sm font-medium text-green-800">
                Historical Average
              </div>
              <div className="text-xs text-green-600 mt-1">
                {queryParams?.variable === 'max_temp' || queryParams?.variable === 'min_temp' ? '°C' : 
                 queryParams?.variable === 'precipitation' ? 'mm' : 
                 queryParams?.variable === 'wind_speed' ? 'm/s' : 
                 queryParams?.variable === 'humidity' ? 'kg/kg' : ''}
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className={`text-4xl font-bold mb-2 ${ 
                (getStatValue('trendChange') || 0) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {(getStatValue('trendChange') || 0) > 0 ? '+' : ''}{(getStatValue('trendChange') || 0).toFixed(1)}%
              </div>
              <div className="text-sm font-medium text-orange-800">
                Trend Change
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Over {getStatValue('dataYears') || 'multiple'} years
              </div>
            </div>
          </div>          {/* Trend Analysis */}
          {data?.trendAnalysis && (
            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trend Analysis
              </h3>
              <p className="text-indigo-700 leading-relaxed">
                {data.trendAnalysis}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Historical Distribution
          </h3>
          <p className="text-purple-100 text-sm mt-1">
            Frequency analysis of weather conditions
          </p>
        </div>
        <div className="p-6">
          <DistributionChart 
            data={getDistributionData()} 
            threshold={queryParams?.threshold}
            variable={queryParams?.variableInfo}
          />
        </div>
      </div>

      {/* Data Source Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2" />
            </svg>
            NASA Data Sources
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {data.dataSources?.map((source, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{source.name}</span>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  View Source
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <strong>Disclaimer:</strong> This analysis is based on historical climatological data 
                  and is not a weather forecast. Results represent long-term statistical patterns 
                  and should not be used for short-term weather prediction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPanel;