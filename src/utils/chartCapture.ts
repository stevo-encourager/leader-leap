
import { Category } from './assessmentTypes';

// Helper function to capture radar chart as high-quality PNG
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // Wait for chart to fully render
    setTimeout(() => {
      // Try multiple selectors for the radar chart
      const selectors = [
        '.recharts-surface',
        'svg.recharts-surface',
        '.recharts-wrapper svg',
        '[data-testid="radar-chart"] svg',
        '.recharts-radar-chart svg',
        '.recharts-container svg'
      ];
      
      let chartElement: SVGElement | null = null;
      
      for (const selector of selectors) {
        const element = document.querySelector(selector) as SVGElement;
        if (element && element.tagName.toLowerCase() === 'svg') {
          chartElement = element;
          console.log('ChartCapture: Found chart SVG element with selector:', selector);
          console.log('ChartCapture: SVG dimensions:', {
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            viewBox: element.getAttribute('viewBox'),
            boundingRect: element.getBoundingClientRect()
          });
          break;
        }
      }
      
      if (!chartElement) {
        console.warn('ChartCapture: No radar chart SVG element found. Available elements:');
        selectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          console.log(`ChartCapture: ${selector} found ${found.length} elements`);
        });
        resolve(null);
        return;
      }
      
      try {
        // Get the SVG's computed styles and dimensions
        const svgRect = chartElement.getBoundingClientRect();
        const svgWidth = svgRect.width || parseInt(chartElement.getAttribute('width') || '400');
        const svgHeight = svgRect.height || parseInt(chartElement.getAttribute('height') || '400');
        
        console.log('ChartCapture: Using dimensions:', { svgWidth, svgHeight });
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = chartElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions and viewBox
        clonedSvg.setAttribute('width', svgWidth.toString());
        clonedSvg.setAttribute('height', svgHeight.toString());
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Ensure viewBox is set correctly
        if (!clonedSvg.getAttribute('viewBox')) {
          clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        }
        
        // Inline all styles to ensure they're preserved
        const inlineStyles = (element: Element) => {
          const computedStyle = window.getComputedStyle(element);
          let styleStr = '';
          
          // Copy important style properties
          const importantProps = [
            'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 
            'font-weight', 'color', 'opacity', 'transform'
          ];
          
          importantProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none') {
              styleStr += `${prop}: ${value}; `;
            }
          });
          
          if (styleStr) {
            element.setAttribute('style', styleStr);
          }
          
          // Recursively apply to children
          for (let i = 0; i < element.children.length; i++) {
            inlineStyles(element.children[i]);
          }
        };
        
        console.log('ChartCapture: Inlining styles...');
        inlineStyles(clonedSvg);
        
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        console.log('ChartCapture: SVG data length:', svgData.length);
        console.log('ChartCapture: SVG data preview:', svgData.substring(0, 200) + '...');
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Create canvas for high-quality rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('ChartCapture: Could not get canvas context');
          resolve(null);
          return;
        }
        
        // Set high resolution for better quality
        const scale = 2;
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        ctx.scale(scale, scale);
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, svgWidth, svgHeight);
        
        const img = new Image();
        img.onload = () => {
          console.log('ChartCapture: Image loaded successfully');
          ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
          URL.revokeObjectURL(svgUrl);
          
          // Convert to high-quality PNG
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('ChartCapture: PNG data URL length:', pngDataUrl.length);
          console.log('ChartCapture: PNG data URL preview:', pngDataUrl.substring(0, 100) + '...');
          
          // Validate that we actually have image data
          if (pngDataUrl.length > 1000) { // Basic validation
            console.log('ChartCapture: Successfully captured radar chart as PNG');
            resolve(pngDataUrl);
          } else {
            console.error('ChartCapture: Generated PNG seems too small, might be empty');
            resolve(null);
          }
        };
        
        img.onerror = (error) => {
          console.error('ChartCapture: Failed to load SVG image:', error);
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
        
        img.src = svgUrl;
        
      } catch (error) {
        console.error('ChartCapture: Error capturing radar chart:', error);
        resolve(null);
      }
    }, 2000); // Increased wait time for chart to fully render
  });
};

// Test function to validate chart capture
export const testChartCapture = async (): Promise<void> => {
  console.log('ChartCapture: Starting test capture...');
  const dataUrl = await captureRadarChartAsPNG();
  
  if (dataUrl) {
    console.log('ChartCapture: Test successful - chart captured');
    
    // Create a temporary download link to verify the image
    const link = document.createElement('a');
    link.download = 'test-radar-chart.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error('ChartCapture: Test failed - no chart captured');
  }
};
