
import html2canvas from 'html2canvas';
import { Buffer } from 'buffer';

// Ensure Buffer is available globally for @react-pdf/renderer
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Enhanced radar chart capture with buffer handling for PDF compatibility
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
          
          if (isVisible) {
            // Look for SVG inside this element
            const svg = element.querySelector('svg');
            if (svg) {
              const svgRect = svg.getBoundingClientRect();
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
          scale: 2, // Reduced from 3 to 2 for better compatibility
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: Math.round(finalRect.width),
          height: Math.round(finalRect.height),
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: true,
          removeContainer: false,
          onclone: (clonedDoc) => {
            console.log('ChartCapture: Processing cloned document for SVG elements');
            const clonedSvgs = clonedDoc.querySelectorAll('svg');
            clonedSvgs.forEach((svg) => {
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
        
        // Convert to PNG with high quality but reduced file size for PDF compatibility
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        
        // Validate the result
        if (!dataUrl || !dataUrl.startsWith('data:image/png') || dataUrl.length < 1000) {
          console.error('ChartCapture: Invalid or empty PNG data', {
            hasDataUrl: !!dataUrl,
            correctFormat: dataUrl?.startsWith('data:image/png'),
            dataLength: dataUrl?.length || 0
          });
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Successfully captured chart image, size:', dataUrl.length);
        resolve(dataUrl);
        
      } catch (error) {
        console.error('ChartCapture: Error during capture:', error);
        resolve(null);
      }
    }, 3000);
  });
};
