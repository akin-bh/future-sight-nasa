import React from 'react';

function Navbar({ onDataSourcesClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="h-12 w-12 flex items-center justify-center">
                <img 
                  src="/images/logo.png" 
                  alt="Future Sight Logo"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Future Sight
                </h1>
                <p className="text-xs text-gray-500">
                  AI-Powered Weather Prediction
                </p>
              </div>
            </a>
            {/* NASA Partnership Badge */}
            <div className="ml-4 flex items-center">
              <img 
                src="/images/nasa-logo.png" 
                alt="NASA Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  console.log('NASA logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
              <span className="ml-2 text-xs text-gray-500 font-medium">
                Powered by NASA Data
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="#analysis"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Analysis
              </a>
              <a
                href="#visualizations"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Visualizations
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </a>
              <a
                href="#team"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Team
              </a>
              <button
                onClick={onDataSourcesClick}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Data Sources
              </button>
              <a
                href="https://nasa.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                NASA EO Data
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;