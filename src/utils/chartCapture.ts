
import html2canvas from 'html2canvas';

// Enhanced radar chart capture with comprehensive debugging and error handling
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting enhanced radar chart capture...');
    
    // Wait longer for chart to fully render and stabilize
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart with enhanced selectors...');
      
      // Enhanced selector strategy - check the most specific ones first
      const selectors = [
        '[data-testid="radar-chart-container"]',
        '.radar-chart-container',
        '[data-chart-type="radar"]',
        '.recharts-wrapper',
        '.recharts-radar-chart',
        '.recharts-surface'
      ];
      
      let chartContainer: HTMLElement | null = null;
      
      // Try each selector and pick the first one with valid content
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`ChartCapture: Checking selector "${selector}" - found ${elements.length} elements`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          
          // Check if element is visible and has dimensions
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && element.offsetParent !== null;
          
          console.log(`ChartCapture: Element ${i} check:`, {
            selector,
            width: rect.width,
            height: rect.height,
            isVisible,
            hasChildren: element.children.length > 0
          });
          
          if (isVisible) {
            // Look for SVG inside this element
            const svg = element.querySelector('svg');
            if (svg) {
              const svgRect = svg.getBoundingClientRect();
              console.log('ChartCapture: Found SVG:', {
                svgWidth: svgRect.width,
                svgHeight: svgRect.height,
                svgVisible: svgRect.width > 0 && svgRect.height > 0,
                svgChildren: svg.children.length
              });
              
              if (svgRect.width > 0 && svgRect.height > 0) {
                chartContainer = element;
                console.log(`ChartCapture: Selected chart container with selector: ${selector}`);
                break;
              }
            } else if (isVisible && element.children.length > 0) {
              // Fallback: accept container even without SVG if it has content
              chartContainer = element;
              console.log(`ChartCapture: Selected fallback container with selector: ${selector}`);
              break;
            }
          }
        }
        if (chartContainer) break;
      }
      
      if (!chartContainer) {
        console.error('ChartCapture: No valid radar chart container found');
        
        // Enhanced debugging: List all possible chart elements
        const debugElements = document.querySelectorAll('[class*="chart"], [class*="radar"], [data-testid*="chart"], svg');
        console.log('ChartCapture: Found potential chart elements:', debugElements.length);
        debugElements.forEach((el, index) => {
          const htmlEl = el as HTMLElement;
          const rect = htmlEl.getBoundingClientRect();
          console.log(`Debug element ${index}:`, {
            tagName: htmlEl.tagName,
            className: htmlEl.className,
            testId: htmlEl.getAttribute('data-testid'),
            dimensions: `${rect.width}x${rect.height}`,
            visible: rect.width > 0 && rect.height > 0
          });
        });
        
        resolve(null);
        return;
      }
      
      try {
        console.log('ChartCapture: Waiting for chart animations to complete...');
        // Wait longer for any animations or data loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify container is still valid
        const finalRect = chartContainer.getBoundingClientRect();
        if (finalRect.width === 0 || finalRect.height === 0) {
          console.error('ChartCapture: Chart container became invalid during wait');
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Starting html2canvas capture...');
        
        // Enhanced html2canvas options for better SVG capture
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: false,
          logging: false, // Disable logging to reduce noise
          width: Math.round(finalRect.width),
          height: Math.round(finalRect.height),
          scrollX: 0,
          scrollY: 0,
          // Critical SVG handling options
          foreignObjectRendering: true,
          removeContainer: false,
          // Force SVG rendering
          onclone: (clonedDoc) => {
            console.log('ChartCapture: Processing cloned document for SVG elements');
            const clonedSvgs = clonedDoc.querySelectorAll('svg');
            clonedSvgs.forEach((svg) => {
              // Ensure SVG has explicit dimensions
              if (!svg.getAttribute('width') && finalRect.width > 0) {
                svg.setAttribute('width', finalRect.width.toString());
              }
              if (!svg.getAttribute('height') && finalRect.height > 0) {
                svg.setAttribute('height', finalRect.height.toString());
              }
            });
          }
        });
        
        console.log('ChartCapture: html2canvas completed:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          canvasArea: canvas.width * canvas.height
        });
        
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.error('ChartCapture: Invalid canvas generated');
          resolve(null);
          return;
        }
        
        // Convert to PNG with maximum quality
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Validate the result
        if (!dataUrl || !dataUrl.startsWith('data:image/png') || dataUrl.length < 2000) {
          console.error('ChartCapture: Invalid or empty PNG data', {
            hasDataUrl: !!dataUrl,
            correctFormat: dataUrl?.startsWith('data:image/png'),
            dataLength: dataUrl?.length || 0
          });
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Successfully captured chart image');
        resolve(dataUrl);
        
      } catch (error) {
        console.error('ChartCapture: Error during capture:', error);
        resolve(null);
      }
    }, 3000); // Increased delay to ensure chart is fully rendered
  });
};
