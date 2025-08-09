
import html2canvas from 'html2canvas';

/**
 * CRITICAL FOR PDF EXPORT: Enhanced radar chart capture logic with improved error handling
 * 
 * This function is essential for PDF export functionality. It captures the radar chart
 * as a PNG image that gets embedded in the PDF. The primary selector used is:
 * [data-testid="radar-chart-container"]
 * 
 * DO NOT CHANGE the primary selector without updating the SkillGapChart component!
 * The data-testid="radar-chart-container" attribute in SkillGapChart.tsx must match
 * the primary selector here, or PDF exports will fail.
 */
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    
    // Wait for chart to fully render
    setTimeout(async () => {
  
      
      /**
       * SELECTOR PRIORITY ORDER:
       * 1. [data-testid="radar-chart-container"] - PRIMARY SELECTOR (must not be changed!)
       * 2. Fallback selectors for backwards compatibility
       * 3. .recharts-surface - Last resort fallback to SVG element
       */
      const selectors = [
        '[data-testid="radar-chart-container"]', // PRIMARY - DO NOT REMOVE!
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
          break;
        }
      }
      
      if (!radarContainer) {
        console.error('ChartCapture: CRITICAL ERROR - No radar chart container found with any selector!');
        console.error('ChartCapture: This usually means the data-testid="radar-chart-container" attribute is missing from SkillGapChart.tsx');

        resolve(null);
        return;
      }
      

      
      // For SVG elements, try to find a suitable parent container
      if (radarContainer.tagName.toLowerCase() === 'svg') {
        let parentContainer = radarContainer.parentElement;
        
        // Walk up the DOM to find a suitable container
        while (parentContainer && parentContainer !== document.body) {
          if (parentContainer.offsetWidth > radarContainer.offsetWidth || 
              parentContainer.classList.contains('recharts-wrapper') ||
              parentContainer.classList.contains('radar-chart-container') ||
              parentContainer.getAttribute('data-testid') === 'radar-chart-container') {
            radarContainer = parentContainer;
            break;
          }
          parentContainer = parentContainer.parentElement;
        }
      }
      
      // Ensure the container is visible
      if (radarContainer.offsetWidth === 0 || radarContainer.offsetHeight === 0) {
        resolve(null);
        return;
      }
      let originalStyles: { width: string; height: string; minWidth: string; minHeight: string; flexShrink: string } | null = null;
      try {
        // Wait a bit more for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Targeted mobile fix: temporarily force a fixed canvas size to avoid horizontal compression
        originalStyles = {
          width: (radarContainer as HTMLElement).style.width,
          height: (radarContainer as HTMLElement).style.height,
          minWidth: (radarContainer as HTMLElement).style.minWidth,
          minHeight: (radarContainer as HTMLElement).style.minHeight,
          flexShrink: (radarContainer as HTMLElement).style.flexShrink,
        };
        const shouldForceFixedSize = window.innerWidth <= 768; // mobile and small tablets
        if (shouldForceFixedSize) {
          (radarContainer as HTMLElement).style.width = '630px';
          (radarContainer as HTMLElement).style.height = '530px';
          (radarContainer as HTMLElement).style.minWidth = '630px';
          (radarContainer as HTMLElement).style.minHeight = '530px';
          (radarContainer as HTMLElement).style.flexShrink = '0';
          // Allow layout to settle
          await new Promise(r => setTimeout(r, 150));
        }
        
        // Use html2canvas with settings optimized for chart capture
        const canvas = await html2canvas(radarContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: (radarContainer as HTMLElement).offsetWidth,
          height: (radarContainer as HTMLElement).offsetHeight,
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
        
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Generated canvas has zero dimensions');
        }
        
        // Convert to PNG data URL with high quality
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Validate that we have substantial image data
        if (pngDataUrl.length > 2000) {
          resolve(pngDataUrl);
        } else {
          resolve(null);
        }
      } catch (error) {
        resolve(null);
      } finally {
        // Revert any temporary style overrides
        if (radarContainer) {
          (radarContainer as HTMLElement).style.width = originalStyles?.width || '';
          (radarContainer as HTMLElement).style.height = originalStyles?.height || '';
          (radarContainer as HTMLElement).style.minWidth = originalStyles?.minWidth || '';
          (radarContainer as HTMLElement).style.minHeight = originalStyles?.minHeight || '';
          (radarContainer as HTMLElement).style.flexShrink = originalStyles?.flexShrink || '';
        }
      }
    }, 2000); // Use 2000ms as in working version
  });
};
