
import React, { useState } from 'react';
import MinimalSummaryTest from '@/components/test/MinimalSummaryTest';
import MinimalRadarChartPDF from '@/components/test/MinimalRadarChartPDF';

const TestComponents: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'summary' | 'chart'>('summary');

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Isolated Component Tests</h1>
      <p>Testing components in isolation to identify and fix issues.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTest('summary')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTest === 'summary' ? '#3b82f6' : '#e5e7eb',
            color: activeTest === 'summary' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Summary Test
        </button>
        
        <button 
          onClick={() => setActiveTest('chart')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: activeTest === 'chart' ? '#3b82f6' : '#e5e7eb',
            color: activeTest === 'chart' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Radar Chart PDF Test
        </button>
      </div>
      
      <div style={{ border: '2px solid #d1d5db', borderRadius: '8px', padding: '20px' }}>
        {activeTest === 'summary' && <MinimalSummaryTest />}
        {activeTest === 'chart' && <MinimalRadarChartPDF />}
      </div>
    </div>
  );
};

export default TestComponents;
