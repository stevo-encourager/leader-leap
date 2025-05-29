
import { Category } from './assessmentTypes';

// Enhanced DOM inspection function
const inspectChartDOM = () => {
  console.log('=== ENHANCED CHART DOM INSPECTION ===');
  
  // Check for radar chart containers
  const radarContainers = document.querySelectorAll('[data-testid="radar-chart-container"], [data-chart-type="radar"], .radar-chart-container');
  console.log('Radar containers found:', radarContainers.length);
  
  radarContainers.forEach((container, index) => {
    console.log(`Container ${index}:`, {
      tagName: container.tagName,
      className: container.className,
      id: container.id,
      testId: container.getAttribute('data-testid'),
      chartType: container.getAttribute('data-chart-type'),
      outerHTML: container.outerHTML.substring(0, 400) + '...'
    });
    
    const svgsInContainer = container.querySelectorAll('svg');
    console.log(`SVGs in container ${index}:`, svgsInContainer.length);
    
    svgsInContainer.forEach((svg, svgIndex) => {
      const rect = svg.getBoundingClientRect();
      console.log(`  SVG ${svgIndex}:`, {
        className: svg.className.baseVal || svg.className,
        width: rect.width,
        height: rect.height,
        area: rect.width * rect.height,
        attributes: {
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox')
        }
      });
    });
  });
  
  // Check all SVGs
  const allSvgs = document.querySelectorAll('svg');
  console.log('Total SVGs in document:', allSvgs.length);
  
  console.log('=== END ENHANCED INSPECTION ===');
};

// Helper function to capture radar chart as high-quality PNG
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // First, do enhanced DOM inspection
    inspectChartDOM();
    
    // Wait for chart to fully render
    setTimeout(() => {
      console.log('ChartCapture: Looking for radar chart container...');
      
      // Use the confirmed working selector
      const radarContainer = document.querySelector('[data-testid="radar-chart-container"]');
      
      if (!radarContainer) {
        console.warn('ChartCapture: No radar chart container found with data-testid="radar-chart-container"');
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Found radar chart container:', radarContainer);
      
      // Get all SVGs inside the radar chart container using the confirmed working selector
      const svgsInContainer = radarContainer.querySelectorAll('svg');
      console.log(`ChartCapture: Found ${svgsInContainer.length} SVGs in radar chart container`);
      
      if (svgsInContainer.length === 0) {
        console.warn('ChartCapture: No SVGs found inside radar chart container');
        resolve(null);
        return;
      }
      
      // Find the largest SVG by area (likely the main chart)
      let selectedSvg: SVGElement | null = null;
      let largestArea = 0;
      
      svgsInContainer.forEach((svg, index) => {
        const rect = svg.getBoundingClientRect();
        const area = rect.width * rect.height;
        
        console.log(`ChartCapture: SVG ${index} dimensions:`, {
          width: rect.width,
          height: rect.height,
          area: area,
          className: svg.className.baseVal || svg.className
        });
        
        // Select SVG with largest area and reasonable size
        if (area > largestArea && rect.width > 200 && rect.height > 200) {
          largestArea = area;
          selectedSvg = svg as SVGElement;
          console.log(`ChartCapture: Selected SVG ${index} as largest (area: ${area})`);
        }
      });
      
      // Fallback to first SVG if no large SVG found
      if (!selectedSvg && svgsInContainer.length > 0) {
        selectedSvg = svgsInContainer[0] as SVGElement;
        console.log('ChartCapture: Using first SVG as fallback');
      }
      
      if (!selectedSvg) {
        console.warn('ChartCapture: No suitable SVG found in radar chart container');
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Selected SVG for capture:', selectedSvg);
      
      try {
        // Get the SVG's computed styles and dimensions
        const svgRect = selectedSvg.getBoundingClientRect();
        const svgWidth = svgRect.width || parseInt(selectedSvg.getAttribute('width') || '600');
        const svgHeight = svgRect.height || parseInt(selectedSvg.getAttribute('height') || '400');
        
        console.log('ChartCapture: Using radar chart SVG with dimensions:', { svgWidth, svgHeight });
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = selectedSvg.cloneNode(true) as SVGElement;
        
        // Set wider dimensions for better proportions in PDF
        const finalWidth = Math.max(svgWidth, 600); // Increased from 480
        const finalHeight = Math.max(svgHeight, 400); // Increased from 350
        
        clonedSvg.setAttribute('width', finalWidth.toString());
        clonedSvg.setAttribute('height', finalHeight.toString());
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // Ensure viewBox is set correctly
        if (!clonedSvg.getAttribute('viewBox')) {
          clonedSvg.setAttribute('viewBox', `0 0 ${finalWidth} ${finalHeight}`);
        }
        
        // Inline all styles to ensure they're preserved
        const inlineStyles = (element: Element) => {
          const computedStyle = window.getComputedStyle(element);
          let styleStr = '';
          
          // Copy important style properties
          const importantProps = [
            'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 
            'font-weight', 'color', 'opacity', 'transform', 'stroke-dasharray'
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
        console.log('ChartCapture: SVG data preview:', svgData.substring(0, 300) + '...');
        
        // Validate SVG content for radar chart
        const hasRadarContent = svgData.includes('polygon') || 
                                svgData.includes('recharts-radar') || 
                                svgData.includes('recharts-polar') ||
                                (svgData.includes('path') && svgData.includes('d="M'));
        
        if (!hasRadarContent) {
          console.warn('ChartCapture: SVG appears to be empty or not a radar chart. Content preview:', svgData.substring(0, 500));
          resolve(null);
          return;
        }
        
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
        canvas.width = finalWidth * scale;
        canvas.height = finalHeight * scale;
        ctx.scale(scale, scale);
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        
        const img = new Image();
        img.onload = () => {
          console.log('ChartCapture: Radar chart image loaded successfully');
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          URL.revokeObjectURL(svgUrl);
          
          // Convert to high-quality PNG
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('ChartCapture: PNG data URL length:', pngDataUrl.length);
          
          // Validate that we actually have image data
          if (pngDataUrl.length > 1000) {
            console.log('ChartCapture: Successfully captured radar chart as PNG');
            resolve(pngDataUrl);
          } else {
            console.error('ChartCapture: Generated PNG seems too small, might be empty');
            resolve(null);
          }
        };
        
        img.onerror = (error) => {
          console.error('ChartCapture: Failed to load radar chart SVG image:', error);
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
        
        img.src = svgUrl;
        
      } catch (error) {
        console.error('ChartCapture: Error capturing radar chart:', error);
        resolve(null);
      }
    }, 2000); // Wait for chart to fully render
  });
};

// Test function to validate chart capture
export const testChartCapture = async (): Promise<void> => {
  console.log('ChartCapture: Starting test capture...');
  
  // First inspect the DOM
  inspectChartDOM();
  
  const dataUrl = await captureRadarChartAsPNG();
  
  if (dataUrl) {
    console.log('ChartCapture: Test successful - radar chart captured');
    
    // Create a temporary download link to verify the image
    const link = document.createElement('a');
    link.download = 'test-radar-chart.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('ChartCapture: Test radar chart image downloaded for verification');
  } else {
    console.error('ChartCapture: Test failed - no radar chart captured');
  }
};
