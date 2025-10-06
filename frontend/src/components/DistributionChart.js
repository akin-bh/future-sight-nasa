import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DistributionChart({ data, threshold, variable }) {
  if (!data || !data.bins || !data.frequencies) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No distribution data available</p>
      </div>
    );
  }

  // Create colors for bars - highlight adverse conditions (above/below threshold)
  const backgroundColors = data.bins.map(bin => {
    const binValue = (bin.min + bin.max) / 2;
    
    // Check if this bin represents adverse conditions
    let isAdverse = false;
    if (variable?.operator === '≥') {
      isAdverse = binValue >= threshold;
    } else if (variable?.operator === '≤') {
      isAdverse = binValue <= threshold;
    }
    
    return isAdverse ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.6)';
  });

  const borderColors = data.bins.map(bin => {
    const binValue = (bin.min + bin.max) / 2;
    
    let isAdverse = false;
    if (variable?.operator === '≥') {
      isAdverse = binValue >= threshold;
    } else if (variable?.operator === '≤') {
      isAdverse = binValue <= threshold;
    }
    
    return isAdverse ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)';
  });

  const chartData = {
    labels: data.bins.map(bin => `${bin.min.toFixed(1)} - ${bin.max.toFixed(1)}`),
    datasets: [
      {
        label: 'Frequency',
        data: data.frequencies,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Distribution of ${variable?.name || 'Weather Variable'} Values`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const binIndex = context[0].dataIndex;
            const bin = data.bins[binIndex];
            return `${bin.min.toFixed(1)} - ${bin.max.toFixed(1)} ${variable?.unit || ''}`;
          },
          label: (context) => {
            const frequency = context.parsed.y;
            const total = data.frequencies.reduce((sum, freq) => sum + freq, 0);
            const percentage = ((frequency / total) * 100).toFixed(1);
            return `Frequency: ${frequency} (${percentage}%)`;
          },
          afterLabel: (context) => {
            const binIndex = context.dataIndex;
            const bin = data.bins[binIndex];
            const binValue = (bin.min + bin.max) / 2;
            
            let isAdverse = false;
            if (variable?.operator === '≥') {
              isAdverse = binValue >= threshold;
            } else if (variable?.operator === '≤') {
              isAdverse = binValue <= threshold;
            }
            
            return isAdverse ? `⚠️ Adverse condition (${variable?.condition})` : '';
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `${variable?.name || 'Value'} (${variable?.unit || ''})`,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency (Days)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 bg-opacity-60 border border-blue-500 mr-2"></div>
          <span>Normal conditions</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 bg-opacity-80 border border-red-500 mr-2"></div>
          <span>Adverse conditions ({variable?.condition})</span>
        </div>
      </div>
      
      {/* Threshold indicator */}
      {threshold && variable && (
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Your threshold:</strong> {variable.operator} {threshold} {variable.unit}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Red bars indicate conditions that meet or exceed your adverse threshold
          </p>
        </div>
      )}
    </div>
  );
}

export default DistributionChart;