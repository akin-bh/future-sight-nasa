import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Weather Risk Analysis
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Powered by NASA Earth Observation data, this application provides historical 
              weather risk analysis to help you understand long-term climate patterns and 
              make informed decisions about weather-sensitive activities.
            </p>
          </div>

          {/* NASA Data Sources */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/images/nasa-logo.png" 
                alt="NASA Logo"
                className="h-6 w-auto object-contain mr-2"
                onError={(e) => {
                  console.log('NASA logo failed to load in footer');
                  e.target.style.display = 'none';
                }}
              />
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                NASA Data Sources
              </h4>
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://disc.gsfc.nasa.gov/datasets/AIRS3STM_7.0/summary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  AIRS Temperature Data
                </a>
              </li>
              <li>
                <a
                  href="https://disc.gsfc.nasa.gov/datasets/GLDAS_NOAH025_3H_2.1/summary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  GLDAS Land Surface Data
                </a>
              </li>
              <li>
                <a
                  href="https://giovanni.gsfc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Giovanni Data Access
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  NASA Official Site
                </a>
              </li>
              <li>
                <a
                  href="https://earthdata.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  NASA Earthdata
                </a>
              </li>
              <li>
                <a
                  href="#api-docs"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                © 2025 Weather Risk Analysis. Powered by NASA Earth Observation Data.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                API Status: Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;