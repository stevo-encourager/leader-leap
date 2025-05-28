
import React, { useState } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip,
  Legend
} from 'recharts';
import jsPDF from 'jspdf';

// Mock chart data
const mockChartData = [
  { subject: 'Strategy', current: 4, desired: 7, fullMark: 10 },
  { subject: 'Communication', current: 6, desired: 8, fullMark: 10 },
  { subject: 'Team Building', current: 5, desired: 7, fullMark: 10 },
  { subject: 'Decision Making', current: 7, desired: 8, fullMark: 10 },
  { subject: 'Emotional Intel', current: 6, desired: 9, fullMark: 10 }
];

// Enhanced chart capture function
const captureChartForPDF = (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('=== MINIMAL CHART CAPTURE START ===');
    
    // Wait for chart to render
    setTimeout(() => {
      // Try multiple selectors
      const selectors = [
        '.recharts-surface',
        'svg.recharts-surface', 
        '.minimal-chart-container svg',
        '.minimal-chart-container canvas',
        'svg',
        'canvas'
      ];
      
      let chartElement: HTMLElement | null = null;
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" found ${elements.length} elements`);
        
        if (elements.length > 0) {
          chartElement = elements[0] as HTMLElement;
          console.log('Found chart element:', {
            tagName: chartElement.tagName,
            id: chartElement.id,
            className: chartElement.className
          });
          break;
        }
      }
      
      if (!chartElement) {
        console.error('No chart element found');
        resolve(null);
        return;
      }
      
      if (chartElement.tagName.toLowerCase() === 'canvas') {
        console.log('Processing CANVAS element');
        const canvas = chartElement as HTMLCanvasElement;
        
        try {
          const dataUrl = canvas.toDataURL('image/png');
          console.log('Canvas dataURL length:', dataUrl.length);
          console.log('Canvas dataURL preview:', dataUrl.substring(0, 100));
          resolve(dataUrl);
        } catch (error) {
          console.error('Canvas capture error:', error);
          resolve(null);
        }
        
      } else if (chartElement.tagName.toLowerCase() === 'svg') {
        console.log('Processing SVG element');
        const svg = chartElement as unknown as SVGElement;
        
        const rect = svg.getBoundingClientRect();
        const svgWidth = rect.width || 400;
        const svgHeight = rect.height || 400;
        
        console.log('SVG dimensions:', { width: svgWidth, height: svgHeight });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Could not get canvas context');
          resolve(null);
          return;
        }
        
        canvas.width = svgWidth;
        canvas.height = svgHeight;
        
        try {
          const svgData = new XMLSerializer().serializeToString(svg);
          const completeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">${svg.innerHTML}</svg>`;
          
          const img = new Image();
          
          img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
            
            const dataUrl = canvas.toDataURL('image/png');
            console.log('SVG dataURL length:', dataUrl.length);
            console.log('SVG dataURL preview:', dataUrl.substring(0, 100));
            URL.revokeObjectURL(img.src);
            resolve(dataUrl);
          };
          
          img.onerror = () => {
            console.error('SVG image load failed');
            URL.revokeObjectURL(img.src);
            resolve(null);
          };
          
          const svgBlob = new Blob([completeSvg], { type: 'image/svg+xml;charset=utf-8' });
          img.src = URL.createObjectURL(svgBlob);
          
        } catch (error) {
          console.error('SVG processing error:', error);
          resolve(null);
        }
      }
      
      console.log('=== MINIMAL CHART CAPTURE END ===');
    }, 3000); // 3 second wait
  });
};

const MinimalRadarChartPDF: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [chartDataUrl, setChartDataUrl] = useState<string | null>(null);

  const handleCaptureTest = async () => {
    setStatus('Capturing chart...');
    const dataUrl = await captureChartForPDF();
    
    if (dataUrl) {
      setChartDataUrl(dataUrl);
      setStatus('Chart captured successfully! Check console for details.');
    } else {
      setStatus('Failed to capture chart. Check console for errors.');
    }
  };

  const handlePDFExport = async () => {
    setStatus('Generating PDF...');
    
    try {
      const dataUrl = await captureChartForPDF();
      
      if (!dataUrl) {
        setStatus('Failed to capture chart for PDF');
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Minimal Radar Chart PDF Test', 20, 20);
      
      // Add chart
      doc.addImage(dataUrl, 'PNG', 20, 40, 160, 120);
      
      // Add status
      doc.setFontSize(12);
      doc.text('Chart captured and added successfully', 20, 180);
      doc.text(`Data URL length: ${dataUrl.length} characters`, 20, 190);
      
      doc.save('minimal-radar-chart-test.pdf');
      setStatus('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      setStatus(`PDF export failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Minimal Radar Chart PDF Test</h1>
      <p>Status: {status}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleCaptureTest}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Chart Capture
        </button>
        
        <button 
          onClick={handlePDFExport}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to PDF
        </button>
      </div>
      
      <div 
        className="minimal-chart-container"
        style={{ 
          width: '100%', 
          height: '400px', 
          border: '1px solid #ccc',
          marginBottom: '20px'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={mockChartData} margin={{ top: 50, right: 80, bottom: 50, left: 80 }}>
            <PolarGrid strokeDasharray="2 2" stroke="#94a3b8" />
            <PolarAngleAxis dataKey="subject" />
            <Radar
              name="Current Level"
              dataKey="current"
              stroke="#2F564D"
              fill="#2F564D"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar
              name="Desired Level"
              dataKey="desired"
              stroke="#8baca5"
              fill="#8baca5"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {chartDataUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>Captured Chart Preview:</h3>
          <img 
            src={chartDataUrl} 
            alt="Captured Chart" 
            style={{ maxWidth: '400px', border: '1px solid #ccc' }}
          />
          <p>Data URL length: {chartDataUrl.length} characters</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', backgroundColor: '#f3f4f6', padding: '16px' }}>
        <h4>Expected Results:</h4>
        <ul>
          <li>Chart renders correctly in the container above</li>
          <li>"Test Chart Capture" should capture the chart and show preview</li>
          <li>"Export to PDF" should create a PDF with the chart image</li>
          <li>Console should show detailed debugging information</li>
          <li>No errors should occur during capture or export</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalRadarChartPDF;
