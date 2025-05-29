
import html2canvas from 'html2canvas';

// Enhanced radar chart capture with better timing and error handling
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting enhanced radar chart capture...');
    
    // First, wait for any pending renders
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart with enhanced selectors...');
      
      // Enhanced selector strategy - check the most specific ones first
      const selectors = [
        '[data-testid="radar-chart-container"]',
        '.radar-chart-container',
        '[data-chart-type="radar"]',
        '.recharts-wrapper',
        '.recharts-radar-chart'
      ];
      
      let chartContainer: HTMLElement | null = null;
      
      // Try each selector and pick the first one with content
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`ChartCapture: Checking selector "${selector}" - found ${elements.length} elements`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          
          // Check if the element itself has dimensions using multiple methods
          const hasOffsetDimensions = element.offsetWidth > 0 && element.offsetHeight > 0;
          const rect = element.getBoundingClientRect();
          const hasBoundingRect = rect.width > 0 && rect.height > 0;
          
          console.log(`ChartCapture: Element ${i} dimensions:`, {
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,
            boundingWidth: rect.width,
            boundingHeight: rect.height,
            hasOffsetDimensions,
            hasBoundingRect
          });
          
          // Element is valid if it has any kind of positive dimensions
          if (hasOffsetDimensions || hasBoundingRect) {
            // Check if it contains an SVG (which means it's the actual chart)
            const svg = element.querySelector('svg');
            if (svg) {
              console.log('ChartCapture: SVG found, checking SVG dimensions...');
              
              // For SVG, be more lenient - check both methods
              const svgRect = svg.getBoundingClientRect();
              const svgHasOffset = svg.offsetWidth > 0 && svg.offsetHeight > 0;
              const svgHasBounding = svgRect.width > 0 && svgRect.height > 0;
              
              console.log(`ChartCapture: SVG dimensions:`, {
                offsetWidth: svg.offsetWidth,
                offsetHeight: svg.offsetHeight,
                boundingWidth: svgRect.width,
                boundingHeight: svgRect.height,
                svgHasOffset,
                svgHasBounding
              });
              
              // Accept SVG if it has any positive dimensions or if parent container is valid
              if (svgHasOffset || svgHasBounding || hasOffsetDimensions) {
                chartContainer = element;
                console.log(`ChartCapture: Found valid chart container using selector: ${selector}`);
                break;
              }
            } else if (hasOffsetDimensions) {
              // Even without SVG, if container has dimensions, it might be valid
              console.log('ChartCapture: No SVG found but container has dimensions, accepting as fallback');
              chartContainer = element;
              break;
            }
          }
        }
        if (chartContainer) break;
      }
      
      if (!chartContainer) {
        console.error('ChartCapture: No valid radar chart container found');
        
        // Debug: Log what elements we can find
        const allContainers = document.querySelectorAll('[class*="radar"], [data-testid*="radar"], [class*="recharts"]');
        console.log('ChartCapture: Available chart-related elements:', allContainers.length);
        allContainers.forEach((el, index) => {
          const htmlEl = el as HTMLElement;
          const svg = htmlEl.querySelector('svg');
          const rect = htmlEl.getBoundingClientRect();
          console.log(`Element ${index}:`, {
            className: htmlEl.className,
            testId: htmlEl.getAttribute('data-testid'),
            offsetDimensions: `${htmlEl.offsetWidth}x${htmlEl.offsetHeight}`,
            boundingDimensions: `${rect.width}x${rect.height}`,
            hasSVG: !!svg,
            svgContent: svg ? 'SVG present' : 'No SVG'
          });
        });
        
        resolve(null);
        return;
      }
      
      const svg = chartContainer.querySelector('svg');
      const containerRect = chartContainer.getBoundingClientRect();
      
      console.log('ChartCapture: Found chart container:', {
        element: chartContainer.tagName,
        className: chartContainer.className,
        offsetDimensions: `${chartContainer.offsetWidth}x${chartContainer.offsetHeight}`,
        boundingDimensions: `${containerRect.width}x${containerRect.height}`,
        hasSVG: !!svg
      });
      
      try {
        // Wait for any animations or transitions to complete
        console.log('ChartCapture: Waiting for chart rendering to complete...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Double-check that the container is still valid before capture
        const finalRect = chartContainer.getBoundingClientRect();
        const stillValid = (chartContainer.offsetWidth > 0 && chartContainer.offsetHeight > 0) || 
                          (finalRect.width > 0 && finalRect.height > 0);
        
        if (!stillValid) {
          console.error('ChartCapture: Chart container became invalid during wait period');
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Starting html2canvas capture...');
        
        // Capture with optimized settings for SVG content
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: chartContainer.offsetWidth || Math.round(containerRect.width),
          height: chartContainer.offsetHeight || Math.round(containerRect.height),
          scrollX: 0,
          scrollY: 0,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          // Enhanced SVG handling
          foreignObjectRendering: true,
          removeContainer: false
        });
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.error('ChartCapture: Generated canvas is invalid');
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Canvas created successfully:', {
          width: canvas.width,
          height: canvas.height,
          area: canvas.width * canvas.height
        });
        
        // Convert to high-quality PNG
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Validate the data URL
        if (!dataUrl || !dataUrl.startsWith('data:image/png') || dataUrl.length < 1000) {
          console.error('ChartCapture: Invalid or empty data URL generated');
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Successfully captured chart image, size:', dataUrl.length);
        resolve(dataUrl);
        
      } catch (error) {
        console.error('ChartCapture: Error during html2canvas capture:', error);
        resolve(null);
      }
    }, 1500); // Increased initial delay to ensure chart is fully rendered
  });
};
