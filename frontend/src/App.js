import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QueryInputModule from './components/QueryInputModule';
import ResultsPanel from './components/ResultsPanel';
import DataVisualization from './components/DataVisualization';
import DataSources from './components/DataSources';
import { useHistoricalData } from './hooks/useHistoricalData';

function App() {
  const [queryParams, setQueryParams] = useState(null);
  const [showDataSources, setShowDataSources] = useState(false);
  const { data, loading, error, fetchData } = useHistoricalData();

  const handleQuerySubmit = (params) => {
    setQueryParams(params);
    fetchData(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onDataSourcesClick={() => setShowDataSources(true)} />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section id="analysis" className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-8">
              {/* NASA Logo and Credibility */}
              <div className="flex justify-center items-center mb-6">
                <img 
                  src="/images/nasa-logo.png" 
                  alt="NASA Logo"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    console.log('NASA logo failed to load in hero');
                    e.target.style.display = 'none';
                  }}
                />
                <div className="ml-4 text-left">
                  <p className="text-blue-200 text-sm font-medium">
                    Official NASA Data Partner
                  </p>
                  <p className="text-blue-300 text-xs">
                    AIRS & GLDAS Satellite Data
                  </p>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Future Sight 
              </h1>
              <p className="text-xl text-blue-100 mb-2">
                AI-Powered Weather Risk Prediction & Historical Analysis
              </p>
              <p className="text-sm text-blue-200">
                Using NASA satellite data to predict future weather patterns based on historical climate trends
              </p>
            </div>
          </div>
        </section>

        {/* Analysis Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Query Panel */}
              <div className="xl:col-span-2">
                <div className="sticky top-8">
                  <QueryInputModule onSubmit={handleQuerySubmit} loading={loading} />
                </div>
              </div>
              
              {/* Results Panel */}
              <div className="xl:col-span-3">
                <ResultsPanel 
                  data={data} 
                  loading={loading} 
                  error={error} 
                  queryParams={queryParams}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Data Visualization Section */}
        <DataVisualization />

        {/* About Section */}
        <section id="about" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              {/* NASA Partnership Highlight */}
              <div className="flex justify-center items-center mb-6">
                <img 
                  src="/images/nasa-logo.png" 
                  alt="NASA Logo"
                  className="h-12 w-auto object-contain mr-4"
                  onError={(e) => {
                    console.log('NASA logo failed to load in about');
                    e.target.style.display = 'none';
                  }}
                />
                <div className="text-left">
                  <p className="text-blue-600 font-semibold text-sm">
                    Powered by NASA Earth Science Data
                  </p>
                  <p className="text-gray-500 text-xs">
                    AIRS & GLDAS Mission Data • 10+ Years Coverage
                  </p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our analysis leverages decades of NASA satellite and reanalysis data to provide 
                statistical insights into historical weather patterns
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Select Location & Date</h3>
                <p className="text-gray-600">
                  Choose any location and specific day of the year to analyze
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Define Conditions</h3>
                <p className="text-gray-600">
                  Set your threshold for what constitutes "adverse" weather
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Get Risk Analysis</h3>
                <p className="text-gray-600">
                  Receive probability statistics and trend analysis with visualizations
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Meet the Team
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Passionate about leveraging NASA data and AI to create innovative weather prediction solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Team Member 1 - Anuj Bhattarai */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="text-center">
                  {/* Profile Photo */}
                  <div className="w-32 h-32 mx-auto mb-6">
                    <img 
                      src="https://media.licdn.com/dms/image/v2/D5603AQFyXHAKOeUIkQ/profile-displayphoto-shrink_200_200/B56ZdVIw13G0Ag-/0/1749480050363?e=2147483647&v=beta&t=sH6J8ElW8ut0ta1wAbcTO63F64SZMGIn3YnYpBHTrzE" 
                      alt="Anuj Bhattarai"
                      className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-lg"
                      onError={(e) => {
                        // Fallback to avatar icon if image doesn't load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                      <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Anuj Bhattarai
                  </h3>
                  
                  <p className="text-blue-600 font-medium mb-4">
                    Lead Developer
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    Passionate about combining NASA satellite data with machine learning to create 
                    innovative weather prediction solutions.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <a 
                      href="https://github.com/akin-bh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Member 2 - Patrick Adamson */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="text-center">
                  {/* Profile Photo */}
                  <div className="w-32 h-32 mx-auto mb-6">
                    <img 
                      src="/images/t2.webp" 
                      alt="Patrick Adamson"
                      className="w-full h-full rounded-full object-cover border-4 border-green-500 shadow-lg"
                      onError={(e) => {
                        // Fallback to avatar icon if image doesn't load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                      <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Patrick Adamson
                  </h3>
                  
                  <p className="text-green-600 font-medium mb-4">
                    Data Collection & Presentation Support
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    Specializes in NASA data collection methodologies and creating compelling presentations 
                    for weather prediction insights and climate analysis visualization.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources Section */}
        <section id="data-sources" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powered by NASA Earth Observation Data
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our analysis draws from multiple NASA satellite missions and reanalysis datasets 
                spanning decades of continuous Earth observation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AIRS</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Atmospheric Infrared Sounder for global temperature measurements
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Temperature
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">GLDAS</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Global Land Data Assimilation System for land surface variables
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Humidity • Precipitation • Wind
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giovanni</h3>
                <p className="text-gray-600 text-sm mb-3">
                  NASA's web-based tool for Earth science data analysis and visualization
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Data Access Tool
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Data Sources Modal */}
      <DataSources 
        isOpen={showDataSources} 
        onClose={() => setShowDataSources(false)} 
      />
    </div>
  );
}

export default App;