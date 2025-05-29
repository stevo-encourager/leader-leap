
import html2canvas from 'html2canvas';

// Enhanced radar chart capture with comprehensive debugging and error handling
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting enhanced radar chart capture with comprehensive debugging...');
    
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
          
          // Check if the element itself has dimensions using getBoundingClientRect
          const rect = element.getBoundingClientRect();
          const hasBoundingRect = rect.width > 0 && rect.height > 0;
          
          console.log(`ChartCapture: Element ${i} dimensions:`, {
            boundingWidth: rect.width,
            boundingHeight: rect.height,
            hasBoundingRect,
            isVisible: element.style.display !== 'none',
            hasChildren: element.children.length > 0
          });
          
          // Element is valid if it has positive dimensions
          if (hasBoundingRect) {
            // Check if it contains an SVG (which means it's the actual chart)
            const svg = element.querySelector('svg');
            if (svg) {
              console.log('ChartCapture: SVG found, checking SVG dimensions...');
              
              // For SVG, use getBoundingClientRect only
              const svgRect = svg.getBoundingClientRect();
              const svgHasBounding = svgRect.width > 0 && svgRect.height > 0;
              
              console.log(`ChartCapture: SVG dimensions:`, {
                boundingWidth: svgRect.width,
                boundingHeight: svgRect.height,
                svgHasBounding,
                svgChildren: svg.children.length,
                svgViewBox: svg.getAttribute('viewBox'),
                svgWidth: svg.getAttribute('width'),
                svgHeight: svg.getAttribute('height')
              });
              
              // Accept SVG if it has positive dimensions OR if parent container is valid
              if (svgHasBounding || hasBoundingRect) {
                chartContainer = element;
                console.log(`ChartCapture: Found valid chart container using selector: ${selector}`);
                console.log('ChartCapture: Container details:', {
                  tagName: element.tagName,
                  className: element.className,
                  id: element.id,
                  testId: element.getAttribute('data-testid'),
                  boundingRect: rect,
                  svgPresent: true,
                  svgRect: svgRect
                });
                break;
              } else {
                console.log('ChartCapture: SVG found but has no valid dimensions');
              }
            } else if (hasBoundingRect) {
              // Even without SVG, if container has dimensions, it might be valid
              console.log('ChartCapture: No SVG found but container has dimensions, accepting as fallback');
              chartContainer = element;
              break;
            }
          } else {
            console.log(`ChartCapture: Element ${i} has no valid dimensions`);
          }
        }
        if (chartContainer) break;
      }
      
      if (!chartContainer) {
        console.error('ChartCapture: No valid radar chart container found');
        
        // Enhanced debugging: Log what elements we can find
        const allContainers = document.querySelectorAll('[class*="radar"], [data-testid*="radar"], [class*="recharts"], .recharts-wrapper');
        console.log('ChartCapture: Available chart-related elements:', allContainers.length);
        allContainers.forEach((el, index) => {
          const htmlEl = el as HTMLElement;
          const svg = htmlEl.querySelector('svg');
          const rect = htmlEl.getBoundingClientRect();
          console.log(`Element ${index}:`, {
            selector: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
            className: htmlEl.className,
            testId: htmlEl.getAttribute('data-testid'),
            boundingDimensions: `${rect.width}x${rect.height}`,
            hasSVG: !!svg,
            svgContent: svg ? `SVG with ${svg.children.length} children` : 'No SVG',
            isVisible: htmlEl.style.display !== 'none' && rect.width > 0 && rect.height > 0
          });
        });
        
        // Additional debugging: Check for any ResponsiveContainer or RadarChart elements
        const responsiveContainers = document.querySelectorAll('.recharts-responsive-container');
        const radarCharts = document.querySelectorAll('.recharts-radar-chart');
        console.log('ChartCapture: Additional debugging:', {
          responsiveContainers: responsiveContainers.length,
          radarCharts: radarCharts.length
        });
        
        resolve(null);
        return;
      }
      
      const svg = chartContainer.querySelector('svg');
      const containerRect = chartContainer.getBoundingClientRect();
      
      console.log('ChartCapture: Found chart container:', {
        element: chartContainer.tagName,
        className: chartContainer.className,
        boundingDimensions: `${containerRect.width}x${containerRect.height}`,
        hasSVG: !!svg,
        containerPosition: {
          top: containerRect.top,
          left: containerRect.left,
          bottom: containerRect.bottom,
          right: containerRect.right
        }
      });
      
      try {
        // Wait for any animations or transitions to complete
        console.log('ChartCapture: Waiting for chart rendering to complete...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Double-check that the container is still valid before capture
        const finalRect = chartContainer.getBoundingClientRect();
        const stillValid = finalRect.width > 0 && finalRect.height > 0;
        
        if (!stillValid) {
          console.error('ChartCapture: Chart container became invalid during wait period');
          console.log('ChartCapture: Final rect:', finalRect);
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Starting html2canvas capture with dimensions:', {
          width: Math.round(containerRect.width),
          height: Math.round(containerRect.height),
          finalWidth: Math.round(finalRect.width),
          finalHeight: Math.round(finalRect.height)
        });
        
        // Capture with optimized settings for SVG content
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: true, // Enable logging temporarily for debugging
          width: Math.round(finalRect.width),
          height: Math.round(finalRect.height),
          scrollX: 0,
          scrollY: 0,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          // Enhanced SVG handling
          foreignObjectRendering: true,
          removeContainer: false
        });
        
        console.log('ChartCapture: html2canvas completed, checking canvas:', {
          canvasExists: !!canvas,
          canvasWidth: canvas?.width || 0,
          canvasHeight: canvas?.height || 0,
          canvasArea: (canvas?.width || 0) * (canvas?.height || 0)
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
        
        console.log('ChartCapture: Data URL generated:', {
          length: dataUrl.length,
          startsWithPNG: dataUrl.startsWith('data:image/png'),
          preview: dataUrl.substring(0, 100) + '...'
        });
        
        // Validate the data URL
        if (!dataUrl || !dataUrl.startsWith('data:image/png') || dataUrl.length < 1000) {
          console.error('ChartCapture: Invalid or empty data URL generated', {
            hasDataUrl: !!dataUrl,
            startsCorrectly: dataUrl?.startsWith('data:image/png'),
            length: dataUrl?.length || 0
          });
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Successfully captured chart image, size:', dataUrl.length);
        resolve(dataUrl);
        
      } catch (error) {
        console.error('ChartCapture: Error during html2canvas capture:', error);
        console.error('ChartCapture: Error details:', {
          message: error.message,
          stack: error.stack,
          containerStillExists: !!document.contains(chartContainer)
        });
        resolve(null);
      }
    }, 2000); // Increased initial delay to ensure chart is fully rendered
  });
};
