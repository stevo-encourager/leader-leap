
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

// Enhanced SVG-to-canvas conversion with style inlining
const svgToCanvas = (svgElement: SVGElement): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get computed styles for all elements
      const getAllComputedStyles = (element: Element): string => {
        const computedStyle = window.getComputedStyle(element);
        let styleString = '';
        
        // Important style properties for SVG rendering
        const importantProps = [
          'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity',
          'font-family', 'font-size', 'font-weight', 'color', 'text-anchor',
          'dominant-baseline', 'transform'
        ];
        
        importantProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none') {
            styleString += `${prop}:${value};`;
          }
        });
        
        return styleString;
      };
      
      // Apply computed styles inline to all elements
      const applyInlineStyles = (element: Element) => {
        const styles = getAllComputedStyles(element);
        if (styles) {
          element.setAttribute('style', styles);
        }
        
        // Recursively apply to children
        Array.from(element.children).forEach(child => {
          applyInlineStyles(child);
        });
      };
      
      // Apply styles to cloned SVG
      applyInlineStyles(svgClone);
      
      // Get dimensions
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width || 400;
      const height = rect.height || 400;
      
      // Set explicit dimensions on cloned SVG
      svgClone.setAttribute('width', width.toString());
      svgClone.setAttribute('height', height.toString());
      svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Add necessary namespaces
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      
      console.log('SVG Clone dimensions:', { width, height });
      console.log('SVG Clone HTML (first 500 chars):', svgClone.outerHTML.substring(0, 500));
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        resolve(null);
        return;
      }
      
      // Set canvas size with device pixel ratio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      // Create image from styled SVG
      const img = new Image();
      
      img.onload = () => {
        try {
          console.log('Image loaded successfully');
          
          // Clear canvas with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('Final PNG dataURL length:', dataUrl.length);
          console.log('Final PNG dataURL preview:', dataUrl.substring(0, 100));
          
          URL.revokeObjectURL(img.src);
          resolve(dataUrl);
        } catch (error) {
          console.error('Error drawing image to canvas:', error);
          URL.revokeObjectURL(img.src);
          resolve(null);
        }
      };
      
      img.onerror = (error) => {
        console.error('Image load failed:', error);
        URL.revokeObjectURL(img.src);
        resolve(null);
      };
      
      // Convert SVG to blob URL
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      
      console.log('SVG blob created, loading image...');
      img.src = blobUrl;
      
    } catch (error) {
      console.error('Error in svgToCanvas:', error);
      resolve(null);
    }
  });
};

// Enhanced chart capture function
const captureChartForPDF = (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('=== ENHANCED CHART CAPTURE START ===');
    
    // Wait for chart to render
    setTimeout(async () => {
      try {
        // Find the recharts SVG
        const chartSvg = document.querySelector('.recharts-surface') as SVGElement;
        
        if (!chartSvg) {
          console.error('No recharts SVG found');
          resolve(null);
          return;
        }
        
        console.log('Found chart SVG:', {
          tagName: chartSvg.tagName,
          className: chartSvg.className,
          children: chartSvg.children.length
        });
        
        // Use enhanced SVG-to-canvas conversion
        const dataUrl = await svgToCanvas(chartSvg);
        
        if (dataUrl) {
          console.log('✅ Chart captured successfully with enhanced method');
        } else {
          console.error('❌ Enhanced chart capture failed');
        }
        
        resolve(dataUrl);
        
      } catch (error) {
        console.error('Error in enhanced chart capture:', error);
        resolve(null);
      }
      
      console.log('=== ENHANCED CHART CAPTURE END ===');
    }, 3000);
  });
};

const MinimalRadarChartPDF: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [chartDataUrl, setChartDataUrl] = useState<string | null>(null);

  const handleCaptureTest = async () => {
    setStatus('Capturing chart with enhanced method...');
    const dataUrl = await captureChartForPDF();
    
    if (dataUrl) {
      setChartDataUrl(dataUrl);
      setStatus('Chart captured successfully! Check console and preview below.');
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
      doc.text('Enhanced Radar Chart PDF Test', 20, 20);
      
      // Add chart
      doc.addImage(dataUrl, 'PNG', 20, 40, 160, 120);
      
      // Add status
      doc.setFontSize(12);
      doc.text('Chart captured with enhanced SVG-to-canvas conversion', 20, 180);
      doc.text(`Data URL length: ${dataUrl.length} characters`, 20, 190);
      
      doc.save('enhanced-radar-chart-test.pdf');
      setStatus('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      setStatus(`PDF export failed: ${error.message}`);
    }
  };

  const handleTestDataUrl = () => {
    if (chartDataUrl) {
      // Open the data URL in a new window for testing
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Chart PNG Test</title></head>
            <body style="margin: 20px;">
              <h1>Chart PNG Data URL Test</h1>
              <p>This should show the exact chart as captured:</p>
              <img src="${chartDataUrl}" style="border: 1px solid #ccc; max-width: 100%;" />
              <p>Data URL length: ${chartDataUrl.length} characters</p>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Enhanced Radar Chart PDF Test</h1>
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
          Test Enhanced Capture
        </button>
        
        <button 
          onClick={handlePDFExport}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to PDF
        </button>
        
        {chartDataUrl && (
          <button 
            onClick={handleTestDataUrl}
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test PNG in New Window
          </button>
        )}
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
            style={{ maxWidth: '400px', border: '1px solid #ccc', display: 'block', marginBottom: '10px' }}
          />
          <p>Data URL length: {chartDataUrl.length} characters</p>
          <p>Click "Test PNG in New Window" to verify the image renders correctly in isolation.</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', backgroundColor: '#f3f4f6', padding: '16px' }}>
        <h4>Enhanced Testing:</h4>
        <ul>
          <li>Enhanced SVG-to-canvas conversion with style inlining</li>
          <li>Device pixel ratio support for crisp rendering</li>
          <li>Computed styles applied inline to all SVG elements</li>
          <li>Test PNG button opens image in new window for verification</li>
          <li>Console shows detailed conversion process</li>
        </ul>
      </div>
    </div>
  );
};

export default MinimalRadarChartPDF;
