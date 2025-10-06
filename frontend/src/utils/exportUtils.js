export function downloadCSV(data, queryParams) {
  const headers = [
    'Metric',
    'Value',
    'Unit',
    'Description'
  ];

  const rows = [
    ['Historical Probability', data.probability, '%', `Likelihood of ${queryParams?.variableInfo?.condition}`],
    ['Historical Mean', data.historicalMean, queryParams?.variableInfo?.unit || '', 'Average value on this date'],
    ['Trend Change', data.trendChange, '%', `Change over ${data.dataYears} years`],
    ['Data Years', data.dataYears, 'years', 'Total years of data analyzed'],
    ['Location', queryParams?.location || `${queryParams?.latitude}, ${queryParams?.longitude}`, '', 'Analysis location'],
    ['Date', `${queryParams?.month}/${queryParams?.day}`, '', 'Target date (MM/DD)'],
    ['Variable', queryParams?.variableInfo?.name || '', '', 'Weather variable analyzed'],
    ['Threshold', queryParams?.threshold || '', queryParams?.variableInfo?.unit || '', 'Adverse condition threshold'],
    ['Condition', queryParams?.variableInfo?.condition || '', '', 'Adverse condition name']
  ];

  // Add distribution data
  if (data.distributionData?.bins && data.distributionData?.frequencies) {
    rows.push(['', '', '', '']); // Empty row
    rows.push(['Distribution Data', '', '', '']);
    rows.push(['Bin Range', 'Frequency', 'days', 'Historical frequency distribution']);
    
    data.distributionData.bins.forEach((bin, index) => {
      rows.push([
        `${bin.min.toFixed(2)} - ${bin.max.toFixed(2)}`,
        data.distributionData.frequencies[index],
        'days',
        ''
      ]);
    });
  }

  // Add data sources
  if (data.dataSources) {
    rows.push(['', '', '', '']); // Empty row
    rows.push(['Data Sources', '', '', '']);
    data.dataSources.forEach(source => {
      rows.push([source.name, '', '', source.url]);
    });
  }

  // Add metadata
  rows.push(['', '', '', '']);
  rows.push(['Generated', new Date().toISOString(), '', 'Report generation timestamp']);
  rows.push(['Analysis Type', 'Historical Climatological Risk', '', 'Type of analysis performed']);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `weather-risk-analysis-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(data, queryParams) {
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      analysisType: 'Historical Climatological Risk',
      query: {
        location: queryParams?.location || {
          latitude: queryParams?.latitude,
          longitude: queryParams?.longitude
        },
        date: {
          month: queryParams?.month,
          day: queryParams?.day
        },
        variable: {
          id: queryParams?.variable,
          name: queryParams?.variableInfo?.name,
          unit: queryParams?.variableInfo?.unit,
          condition: queryParams?.variableInfo?.condition,
          operator: queryParams?.variableInfo?.operator
        },
        threshold: queryParams?.threshold
      }
    },
    results: {
      probability: {
        value: data.probability,
        unit: '%',
        description: `Likelihood of ${queryParams?.variableInfo?.condition}`
      },
      historicalMean: {
        value: data.historicalMean,
        unit: queryParams?.variableInfo?.unit || '',
        description: 'Average value on this date historically'
      },
      trendChange: {
        value: data.trendChange,
        unit: '%',
        description: `Change over ${data.dataYears} years`,
        period: `${data.dataYears} years`
      },
      trendAnalysis: data.trendAnalysis
    },
    distributionData: data.distributionData,
    dataSources: data.dataSources,
    disclaimer: 'This analysis is based on historical climatological data and is not a weather forecast. Results represent long-term statistical patterns and should not be used for short-term weather prediction.'
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `weather-risk-analysis-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}