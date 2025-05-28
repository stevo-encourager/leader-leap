
import { Category } from './assessmentTypes';

// Helper function to capture radar chart as high-quality PNG
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Wait for chart to fully render
    setTimeout(() => {
      // Try multiple selectors for the radar chart
      const selectors = [
        '.recharts-surface',
        'svg.recharts-surface',
        '.recharts-wrapper svg',
        '[data-testid="radar-chart"] svg'
      ];
      
      let chartElement: SVGElement | null = null;
      
      for (const selector of selectors) {
        const element = document.querySelector(selector) as SVGElement;
        if (element && element.tagName.toLowerCase() === 'svg') {
          chartElement = element;
          console.log('Found chart SVG element with selector:', selector);
          break;
        }
      }
      
      if (!chartElement) {
        console.warn('No radar chart SVG element found');
        resolve(null);
        return;
      }
      
      try {
        // Get the SVG's computed styles
        const svgRect = chartElement.getBoundingClientRect();
        const svgWidth = svgRect.width || 400;
        const svgHeight = svgRect.height || 400;
        
        // Clone the SVG to avoid modifying the original
        const clonedSvg = chartElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions
        clonedSvg.setAttribute('width', svgWidth.toString());
        clonedSvg.setAttribute('height', svgHeight.toString());
        
        // Inline all styles to ensure they're preserved
        const inlineStyles = (element: Element) => {
          const computedStyle = window.getComputedStyle(element);
          let styleStr = '';
          
          for (let i = 0; i < computedStyle.length; i++) {
            const property = computedStyle[i];
            const value = computedStyle.getPropertyValue(property);
            styleStr += `${property}: ${value}; `;
          }
          
          if (styleStr) {
            element.setAttribute('style', styleStr);
          }
          
          // Recursively apply to children
          for (let i = 0; i < element.children.length; i++) {
            inlineStyles(element.children[i]);
          }
        };
        
        inlineStyles(clonedSvg);
        
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Create canvas for high-quality rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Could not get canvas context');
          resolve(null);
          return;
        }
        
        // Set high resolution for better quality
        const scale = 2;
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        ctx.scale(scale, scale);
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, svgWidth, svgHeight);
        
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
          URL.revokeObjectURL(svgUrl);
          
          // Convert to high-quality PNG
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('Successfully captured radar chart as PNG');
          resolve(pngDataUrl);
        };
        
        img.onerror = () => {
          console.error('Failed to load SVG image');
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
        
        img.src = svgUrl;
        
      } catch (error) {
        console.error('Error capturing radar chart:', error);
        resolve(null);
      }
    }, 1500); // Increased wait time for chart to fully render
  });
};
