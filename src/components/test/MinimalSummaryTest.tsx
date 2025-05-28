
import React from 'react';

// Minimal test component to verify Summary rendering without any app dependencies
const MinimalSummaryTest: React.FC = () => {
  const mockSummary = "Based on your leadership assessment, you demonstrate strong foundational skills across multiple competency areas. Your self-awareness and commitment to growth are evident in your thoughtful responses. However, there are several key areas where focused development could significantly enhance your leadership effectiveness and impact within your organization.";

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px' }}>
      <h1>Minimal Summary Test</h1>
      <p>Testing if Summary text has any blue background styling issues.</p>
      
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '16px' }}>
        <h3>Assessment Summary</h3>
        <p style={{ lineHeight: '1.6', color: '#374151' }}>
          {mockSummary}
        </p>
      </div>
      
      <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '16px' }}>
        <h4>Expected Result:</h4>
        <ul>
          <li>No blue background on the summary text</li>
          <li>Clean, readable text with normal styling</li>
          <li>No interference from global CSS</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalSummaryTest;
