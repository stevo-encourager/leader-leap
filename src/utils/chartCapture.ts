
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
    
    const svgInContainer = container.querySelector('svg');
    if (svgInContainer) {
      console.log(`SVG in container ${index}:`, {
        className: svgInContainer.className.baseVal || svgInContainer.className,
        width: svgInContainer.getAttribute('width'),
        height: svgInContainer.getAttribute('height'),
        viewBox: svgInContainer.getAttribute('viewBox')
      });
    }
  });
  
  // Check all SVGs
  const allSvgs = document.querySelectorAll('svg');
  console.log('Total SVGs in document:', allSvgs.length);
  
  allSvgs.forEach((svg, index) => {
    const rect = svg.getBoundingClientRect();
    const parent = svg.parentElement;
    
    console.log(`SVG ${index}:`, {
      className: svg.className.baseVal || svg.className,
      id: svg.id,
      parentTagName: parent?.tagName,
      parentClassName: parent?.className,
      parentTestId: parent?.getAttribute('data-testid'),
      dimensions: { width: rect.width, height: rect.height },
      hasRadarElements: !!(
        svg.querySelector('g[class*="recharts-radar"]') || 
        svg.querySelector('g[class*="recharts-polar"]') ||
        svg.querySelector('polygon') ||
        svg.querySelector('path[d*="M"]')
      ),
      isInRadarContainer: !!(
        svg.closest('[data-testid="radar-chart-container"]') || 
        svg.closest('[data-chart-type="radar"]') ||
        svg.closest('.radar-chart-container')
      )
    });
  });
  
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
      // Updated selectors based on actual DOM structure - more specific order
      const selectors = [
        '[data-testid="radar-chart-container"] svg',
        '[data-chart-type="radar"] svg', 
        '.radar-chart-container svg',
        '[data-testid="radar-chart-container"] .recharts-wrapper svg',
        '.recharts-radar-chart svg', // Added svg suffix
        'svg.recharts-surface',
        '.recharts-surface',
        'svg[class*="recharts"]' // Any SVG with recharts in class
      ];
      
      let chartElement: SVGElement | null = null;
      
      console.log('ChartCapture: Testing selectors in order...');
      
      // Try to find the radar chart SVG with enhanced validation
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`ChartCapture: Selector "${selector}" found ${elements.length} elements`);
        
        for (const element of elements) {
          if (element && element.tagName.toLowerCase() === 'svg') {
            const svgElement = element as SVGElement;
            
            // Enhanced validation to ensure this is the radar chart
            const hasRadarElements = svgElement.querySelector('g[class*="recharts-radar"]') || 
                                     svgElement.querySelector('g[class*="recharts-polar"]') ||
                                     svgElement.querySelector('polygon') ||
                                     svgElement.querySelector('path[d*="M"]');
            
            // Check if it's inside a radar chart container
            const isInRadarContainer = svgElement.closest('[data-testid="radar-chart-container"]') || 
                                       svgElement.closest('[data-chart-type="radar"]') ||
                                       svgElement.closest('.radar-chart-container');
            
            // Size validation - radar chart should be reasonably sized
            const rect = svgElement.getBoundingClientRect();
            const hasReasonableSize = rect.width > 200 && rect.height > 200;
            
            // Check if this is likely a recharts SVG
            const isRechartsElement = svgElement.className.baseVal?.includes('recharts') ||
                                      svgElement.querySelector('.recharts-surface') ||
                                      svgElement.closest('.recharts-wrapper');
            
            console.log(`ChartCapture: Validating SVG with selector "${selector}":`, {
              hasRadarElements: !!hasRadarElements,
              isInRadarContainer: !!isInRadarContainer,
              hasReasonableSize,
              isRechartsElement: !!isRechartsElement,
              dimensions: { width: rect.width, height: rect.height },
              className: svgElement.className.baseVal || 'none'
            });
            
            // Prefer SVGs that are definitely in radar containers
            if (isInRadarContainer && hasReasonableSize && (hasRadarElements || isRechartsElement)) {
              chartElement = svgElement;
              console.log('ChartCapture: Found valid radar chart SVG with selector:', selector);
              break;
            }
          }
        }
        
        if (chartElement) break;
      }
      
      // If no specific radar chart found, try the most likely candidates with relaxed criteria
      if (!chartElement) {
        console.log('ChartCapture: No radar chart found with strict criteria, trying relaxed approach...');
        
        // Look for any reasonably sized SVG within radar containers
        const radarContainers = document.querySelectorAll('[data-testid="radar-chart-container"], [data-chart-type="radar"], .radar-chart-container');
        
        for (const container of radarContainers) {
          const svgInContainer = container.querySelector('svg');
          if (svgInContainer) {
            const rect = svgInContainer.getBoundingClientRect();
            if (rect.width > 200 && rect.height > 200) {
              chartElement = svgInContainer as SVGElement;
              console.log('ChartCapture: Using SVG from radar container with relaxed criteria');
              break;
            }
          }
        }
      }
      
      // Last resort: look for any large recharts SVG
      if (!chartElement) {
        console.log('ChartCapture: Last resort - looking for any large recharts SVG...');
        const allSvgs = document.querySelectorAll('svg');
        
        for (const svg of allSvgs) {
          const rect = svg.getBoundingClientRect();
          const hasRechartsClass = svg.className.baseVal?.includes('recharts');
          const hasRechartsContent = svg.querySelector('.recharts-surface') || 
                                    svg.querySelector('g[class*="recharts"]');
          
          if ((hasRechartsClass || hasRechartsContent) && rect.width > 200 && rect.height > 200) {
            chartElement = svg as SVGElement;
            console.log('ChartCapture: Using recharts SVG as last resort');
            break;
          }
        }
      }
      
      if (!chartElement) {
        console.warn('ChartCapture: No valid radar chart SVG element found after all attempts');
        console.log('ChartCapture: Final DOM state:');
        inspectChartDOM();
        resolve(null);
        return;
      }
      
      try {
        // Get the SVG's computed styles and dimensions
        const svgRect = chartElement.getBoundingClientRect();
        const svgWidth = svgRect.width || parseInt(chartElement.getAttribute('width') || '480');
        const svgHeight = svgRect.height || parseInt(chartElement.getAttribute('height') || '350');
        
        console.log('ChartCapture: Using radar chart SVG with dimensions:', { svgWidth, svgHeight });
        console.log('ChartCapture: SVG element:', chartElement);
        console.log('ChartCapture: SVG className:', chartElement.className.baseVal || chartElement.className);
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = chartElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions and viewBox - wider chart for better balance
        const finalWidth = Math.max(svgWidth, 480); // Increased width for better aspect ratio
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
        
        // Enhanced validation of SVG content for radar chart
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
        
        // Create canvas for high-quality rendering with wider aspect ratio
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('ChartCapture: Could not get canvas context');
          resolve(null);
          return;
        }
        
        // Set high resolution for better quality with wider dimensions
        const scale = 2;
        canvas.width = finalWidth * scale;
        canvas.height = finalHeight * scale;
        ctx.scale(scale, scale);
        
        // Set white background (clean, no borders)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        
        const img = new Image();
        img.onload = () => {
          console.log('ChartCapture: Radar chart image loaded successfully');
          ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
          URL.revokeObjectURL(svgUrl);
          
          // Convert to high-quality PNG (clean output, no overlays)
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
