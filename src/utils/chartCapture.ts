
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
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
            // Check if it contains an SVG (which means it's the actual chart)
            const svg = element.querySelector('svg');
            if (svg && svg.offsetWidth > 0) {
              chartContainer = element;
              console.log(`ChartCapture: Found valid chart container using selector: ${selector}`);
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
          console.log(`Element ${index}:`, {
            className: htmlEl.className,
            testId: htmlEl.getAttribute('data-testid'),
            dimensions: `${htmlEl.offsetWidth}x${htmlEl.offsetHeight}`,
            hasSVG: !!htmlEl.querySelector('svg')
          });
        });
        
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Found chart container:', {
        element: chartContainer.tagName,
        className: chartContainer.className,
        dimensions: `${chartContainer.offsetWidth}x${chartContainer.offsetHeight}`,
        hasSVG: !!chartContainer.querySelector('svg')
      });
      
      try {
        // Wait for any animations or transitions to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capture with optimized settings for SVG content
        const canvas = await html2canvas(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: chartContainer.offsetWidth,
          height: chartContainer.offsetHeight,
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
