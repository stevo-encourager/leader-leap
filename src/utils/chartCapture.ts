
import { Category } from './assessmentTypes';

// Helper function to capture radar chart as high-quality PNG
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // Wait for chart to fully render
    setTimeout(() => {
      // Updated selectors to match actual Recharts DOM structure
      const selectors = [
        '[data-testid="radar-chart-container"] .recharts-wrapper svg',
        '[data-testid="radar-chart-container"] svg',
        '.radar-chart-container .recharts-wrapper svg',
        '.radar-chart-container svg',
        '.recharts-wrapper svg',
        'svg.recharts-surface',
        '.recharts-surface',
        '.recharts-responsive-container svg',
        '.recharts-container .recharts-surface',
        'div[style*="position: relative"] svg',
        'svg[class*="recharts"]',
        'svg'
      ];
      
      let chartElement: SVGElement | null = null;
      
      // Debug: Log all SVG elements found
      const allSvgs = document.querySelectorAll('svg');
      console.log('ChartCapture: Found', allSvgs.length, 'SVG elements in DOM');
      allSvgs.forEach((svg, index) => {
        console.log(`ChartCapture: SVG ${index}:`, {
          className: svg.className.baseVal || svg.className,
          id: svg.id,
          parentClass: svg.parentElement?.className,
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox')
        });
      });
      
      // Try to find the radar chart SVG
      for (const selector of selectors) {
        const element = document.querySelector(selector) as SVGElement;
        if (element && element.tagName.toLowerCase() === 'svg') {
          // Additional validation to ensure this is likely the radar chart
          const hasRadarElements = element.querySelector('g[class*="recharts-radar"]') || 
                                   element.querySelector('g[class*="recharts-polar"]') ||
                                   element.querySelector('polygon') ||
                                   element.querySelector('path[d*="M"]');
          
          if (hasRadarElements) {
            chartElement = element;
            console.log('ChartCapture: Found radar chart SVG element with selector:', selector);
            console.log('ChartCapture: SVG has radar elements:', !!hasRadarElements);
            break;
          } else {
            console.log('ChartCapture: SVG found but no radar elements detected with selector:', selector);
          }
        }
      }
      
      // If no specific radar chart found, try the first SVG with reasonable dimensions
      if (!chartElement && allSvgs.length > 0) {
        for (const svg of allSvgs) {
          const rect = svg.getBoundingClientRect();
          if (rect.width > 200 && rect.height > 200) { // Reasonable chart size
            chartElement = svg as SVGElement;
            console.log('ChartCapture: Using first large SVG as fallback');
            break;
          }
        }
      }
      
      if (!chartElement) {
        console.warn('ChartCapture: No radar chart SVG element found. Available elements:');
        selectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          console.log(`ChartCapture: ${selector} found ${found.length} elements`);
        });
        
        // Debug: Show current page structure
        const radarContainer = document.querySelector('[data-testid="radar-chart-container"]');
        if (radarContainer) {
          console.log('ChartCapture: Radar container found:', radarContainer.innerHTML.substring(0, 500));
        } else {
          console.log('ChartCapture: No radar container found');
        }
        
        resolve(null);
        return;
      }
      
      try {
        // Get the SVG's computed styles and dimensions
        const svgRect = chartElement.getBoundingClientRect();
        const svgWidth = svgRect.width || parseInt(chartElement.getAttribute('width') || '400');
        const svgHeight = svgRect.height || parseInt(chartElement.getAttribute('height') || '400');
        
        console.log('ChartCapture: Using dimensions:', { svgWidth, svgHeight });
        console.log('ChartCapture: SVG bounding rect:', svgRect);
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = chartElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions and viewBox - improved aspect ratio
        const finalWidth = Math.max(svgWidth, 420); // Ensure minimum width for better aspect ratio
        const finalHeight = Math.max(svgHeight, 350);
        
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
        
        // Validate SVG content
        const hasContent = svgData.includes('polygon') || svgData.includes('path') || svgData.includes('circle');
        if (!hasContent) {
          console.warn('ChartCapture: SVG appears to be empty or invalid');
          resolve(null);
          return;
        }
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Create canvas for high-quality rendering with improved aspect ratio
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('ChartCapture: Could not get canvas context');
          resolve(null);
          return;
        }
        
        // Set high resolution for better quality with improved dimensions
        const scale = 2;
        canvas.width = finalWidth * scale;
        canvas.height = finalHeight * scale;
        ctx.scale(scale, scale);
        
        // Set white background (clean, no borders)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        
        const img = new Image();
        img.onload = () => {
          console.log('ChartCapture: Image loaded successfully');
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          URL.revokeObjectURL(svgUrl);
          
          // Convert to high-quality PNG (clean output, no overlays)
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('ChartCapture: PNG data URL length:', pngDataUrl.length);
          console.log('ChartCapture: PNG data URL preview:', pngDataUrl.substring(0, 100) + '...');
          
          // Validate that we actually have image data
          if (pngDataUrl.length > 1000) { // Basic validation
            console.log('ChartCapture: Successfully captured radar chart as PNG with improved dimensions');
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
    }, 2000); // Wait for chart to fully render
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
    
    console.log('ChartCapture: Test image downloaded for verification');
  } else {
    console.error('ChartCapture: Test failed - no chart captured');
  }
};
