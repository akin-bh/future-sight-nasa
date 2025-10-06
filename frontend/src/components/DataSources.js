import React from 'react';

const DataSources = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">NASA Data Sources</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🌡️ Temperature Data - AIRS (Atmospheric Infrared Sounder)
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Dataset:</strong> AIRS/Aqua L3 Monthly Standard Physical Retrieval V7.0
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Source:</strong>{' '}
              <a
                href="https://disc.gsfc.nasa.gov/datasets/AIRS3STM_7.0/summary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                NASA GES DISC - AIRS3STM
              </a>
            </p>
            <p className="text-xs text-gray-600">
              AIRS Science Team (2019), doi:10.5067/Aqua/AIRS/DATA318
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              💧 Humidity, Precipitation & Wind - GLDAS
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Dataset:</strong> GLDAS Noah Land Surface Model L4 3-Hourly V2.1
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Source:</strong>{' '}
              <a
                href="https://disc.gsfc.nasa.gov/datasets/GLDAS_NOAH025_3H_2.1/summary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                NASA GES DISC - GLDAS
              </a>
            </p>
            <p className="text-xs text-gray-600">
              Beaudoing, H., and M. Rodell (2020), doi:10.5067/E7TYRXPJKWOQ
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              🛠️ Data Access Tool - Giovanni
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Tool:</strong> NASA Giovanni - The Bridge Between Data and Science
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Website:</strong>{' '}
              <a
                href="https://giovanni.gsfc.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                giovanni.gsfc.nasa.gov
              </a>
            </p>
            <p className="text-xs text-gray-600">
              NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📖 Additional Resources
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>NASA Earthdata:</strong>{' '}
                <a
                  href="https://earthdata.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  earthdata.nasa.gov
                </a>
              </p>
              <p>
                <strong>AIRS Mission:</strong>{' '}
                <a
                  href="https://airs.jpl.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  airs.jpl.nasa.gov
                </a>
              </p>
              <p>
                <strong>GLDAS Project:</strong>{' '}
                <a
                  href="https://ldas.gsfc.nasa.gov/gldas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:underline"
                >
                  ldas.gsfc.nasa.gov/gldas
                </a>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ⚖️ Data Usage & Citation
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              All NASA data used in Future Sight are publicly available and free for research and educational use.
            </p>
            <p className="text-sm text-gray-700">
              When using this application for research, please cite the appropriate NASA datasets.
              Complete citation information is available in our{' '}
              <a
                href="https://github.com/your-repo/future-sight/blob/main/DATA_SOURCES.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                documentation
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSources;