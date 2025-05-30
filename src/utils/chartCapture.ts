
import html2canvas from 'html2canvas';

// Enhanced radar chart capture logic with improved selector fallbacks
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // Wait for chart to fully render
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart container...');
      
      // Enhanced selectors with recharts-surface fallback - prioritize containers first
      const selectors = [
        '[data-testid="radar-chart-container"]',
        '#radar-chart-container', 
        '[data-chart-type="radar"]',
        '.radar-chart-container',
        '.recharts-radar-chart',
        '.recharts-surface' // Fallback to SVG element itself
      ];
      
      let radarContainer: HTMLElement | null = null;
      let usedSelector = '';
      
      for (const selector of selectors) {
        radarContainer = document.querySelector(selector) as HTMLElement;
        if (radarContainer) {
          usedSelector = selector;
          console.log(`ChartCapture: Found radar chart using selector: ${selector}`);
          break;
        }
      }
      
      if (!radarContainer) {
        console.warn('ChartCapture: No radar chart container found with any selector');
        console.log('ChartCapture: Available elements:', {
          totalElements: document.querySelectorAll('*').length,
          svgElements: document.querySelectorAll('svg').length,
          rechartsElements: document.querySelectorAll('[class*="recharts"]').length,
          rechartsWrappers: document.querySelectorAll('.recharts-wrapper').length,
          rechartsSurfaces: document.querySelectorAll('.recharts-surface').length
        });
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Found radar chart container:', {
        element: radarContainer,
        selector: usedSelector,
        className: radarContainer.className,
        offsetWidth: radarContainer.offsetWidth,
        offsetHeight: radarContainer.offsetHeight,
        isVisible: radarContainer.offsetWidth > 0 && radarContainer.offsetHeight > 0,
        tagName: radarContainer.tagName
      });
      
      // For SVG elements, try to find a suitable parent container
      if (radarContainer.tagName.toLowerCase() === 'svg') {
        console.log('ChartCapture: Found SVG directly, looking for parent container...');
        let parentContainer = radarContainer.parentElement;
        
        // Walk up the DOM to find a suitable container
        while (parentContainer && parentContainer !== document.body) {
          if (parentContainer.offsetWidth > radarContainer.offsetWidth || 
              parentContainer.classList.contains('recharts-wrapper') ||
              parentContainer.classList.contains('radar-chart-container')) {
            console.log('ChartCapture: Using parent container instead of SVG');
            radarContainer = parentContainer;
            break;
          }
          parentContainer = parentContainer.parentElement;
        }
      }
      
      // Ensure the container is visible
      if (radarContainer.offsetWidth === 0 || radarContainer.offsetHeight === 0) {
        console.error('ChartCapture: Chart container has zero dimensions');
        resolve(null);
        return;
      }
      
      try {
        // Wait a bit more for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use html2canvas with settings optimized for chart capture
        const canvas = await html2canvas(radarContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: radarContainer.offsetWidth,
          height: radarContainer.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          // Additional options for better SVG support
          ignoreElements: (element) => {
            // Skip any tooltip or overlay elements that might interfere
            return element.classList.contains('recharts-tooltip-wrapper') ||
                   element.classList.contains('recharts-active-dot');
          }
        });
        
        console.log('ChartCapture: html2canvas capture successful:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          area: canvas.width * canvas.height,
          selectorUsed: usedSelector
        });
        
        // Convert to PNG data URL with high quality
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        console.log('ChartCapture: PNG data URL generated, length:', pngDataUrl.length);
        
        // Validate that we have substantial image data
        if (pngDataUrl.length > 2000) {
          console.log('ChartCapture: Successfully captured radar chart for PDF');
          resolve(pngDataUrl);
        } else {
          console.error('ChartCapture: Generated PNG seems too small, might be empty');
          resolve(null);
        }
        
      } catch (error) {
        console.error('ChartCapture: Error capturing with html2canvas:', error);
        resolve(null);
      }
    }, 2000); // Use 2000ms as in working version
  });
};
