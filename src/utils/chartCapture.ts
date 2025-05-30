
import html2canvas from 'html2canvas';
import { Buffer } from 'buffer';

// Ensure Buffer is available globally for @react-pdf/renderer
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Convert canvas to a simpler PNG format that @react-pdf/renderer can handle better
const optimizeImageForPDF = (canvas: HTMLCanvasElement): string => {
  // Create a new canvas with white background (PDF-friendly)
  const optimizedCanvas = document.createElement('canvas');
  const ctx = optimizedCanvas.getContext('2d');
  
  if (!ctx) {
    console.error('ChartCapture: Failed to get canvas context for optimization');
    return canvas.toDataURL('image/png', 0.8);
  }
  
  // Set canvas size
  optimizedCanvas.width = canvas.width;
  optimizedCanvas.height = canvas.height;
  
  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, optimizedCanvas.width, optimizedCanvas.height);
  
  // Draw the original canvas on top
  ctx.drawImage(canvas, 0, 0);
  
  // Return as PNG with reduced quality for better compatibility
  return optimizedCanvas.toDataURL('image/png', 0.7);
};

// Enhanced radar chart capture with better PDF compatibility
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting enhanced radar chart capture...');
    
    // Wait for chart to fully render and stabilize
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart with enhanced selectors...');
      
      // Enhanced selector strategy
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
              console.log(`ChartCapture: Found SVG:`, {
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
        // Wait for any animations or data loading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify container is still valid
        const finalRect = chartContainer.getBoundingClientRect();
        if (finalRect.width === 0 || finalRect.height === 0) {
          console.error('ChartCapture: Chart container became invalid during wait');
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Starting html2canvas capture...');
        
        // Enhanced html2canvas options for better PDF compatibility
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 1.5, // Reduced scale for better compatibility
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: Math.round(finalRect.width),
          height: Math.round(finalRect.height),
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false, // Disable for better SVG compatibility
          removeContainer: false,
          onclone: (clonedDoc) => {
            console.log('ChartCapture: Processing cloned document for SVG elements');
            const clonedSvgs = clonedDoc.querySelectorAll('svg');
            clonedSvgs.forEach((svg) => {
              // Ensure SVG has proper dimensions
              if (!svg.getAttribute('width') && finalRect.width > 0) {
                svg.setAttribute('width', finalRect.width.toString());
              }
              if (!svg.getAttribute('height') && finalRect.height > 0) {
                svg.setAttribute('height', finalRect.height.toString());
              }
              // Ensure proper viewBox
              if (!svg.getAttribute('viewBox')) {
                svg.setAttribute('viewBox', `0 0 ${finalRect.width} ${finalRect.height}`);
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
        
        // Optimize the image for PDF compatibility
        const optimizedDataUrl = optimizeImageForPDF(canvas);
        
        // Validate the result
        if (!optimizedDataUrl || !optimizedDataUrl.startsWith('data:image/png') || optimizedDataUrl.length < 1000) {
          console.error('ChartCapture: Invalid or empty optimized PNG data', {
            hasDataUrl: !!optimizedDataUrl,
            correctFormat: optimizedDataUrl?.startsWith('data:image/png'),
            dataLength: optimizedDataUrl?.length || 0
          });
          resolve(null);
          return;
        }
        
        console.log('ChartCapture: Successfully captured and optimized chart image, size:', optimizedDataUrl.length);
        resolve(optimizedDataUrl);
        
      } catch (error) {
        console.error('ChartCapture: Error during capture:', error);
        resolve(null);
      }
    }, 3000);
  });
};
