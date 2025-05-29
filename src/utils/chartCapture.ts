
import { Category } from './assessmentTypes';

// Helper function to capture radar chart as high-quality PNG
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // Wait for chart to fully render
    setTimeout(() => {
      // More specific selectors focused on radar chart containers and recharts elements
      const selectors = [
        '[data-testid="radar-chart-container"] .recharts-wrapper svg',
        '[data-testid="radar-chart-container"] svg',
        '.radar-chart-container .recharts-wrapper svg',
        '.radar-chart-container svg',
        '.recharts-wrapper svg',
        'svg.recharts-surface',
        '.recharts-surface'
      ];
      
      let chartElement: SVGElement | null = null;
      
      // Debug: Log all SVG elements found with detailed info
      const allSvgs = document.querySelectorAll('svg');
      console.log('ChartCapture: Found', allSvgs.length, 'SVG elements in DOM');
      allSvgs.forEach((svg, index) => {
        const rect = svg.getBoundingClientRect();
        console.log(`ChartCapture: SVG ${index}:`, {
          className: svg.className.baseVal || svg.className,
          id: svg.id,
          parentClass: svg.parentElement?.className,
          parentId: svg.parentElement?.id,
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          boundingRect: { width: rect.width, height: rect.height },
          hasRadarElements: !!(svg.querySelector('g[class*="recharts-radar"]') || 
                              svg.querySelector('g[class*="recharts-polar"]') ||
                              svg.querySelector('polygon') ||
                              svg.querySelector('path[d*="M"]')),
          isInRadarContainer: !!(svg.closest('[data-testid="radar-chart-container"]') || 
                                 svg.closest('.radar-chart-container'))
        });
      });
      
      // Try to find the radar chart SVG with more specific validation
      for (const selector of selectors) {
        const element = document.querySelector(selector) as SVGElement;
        if (element && element.tagName.toLowerCase() === 'svg') {
          // Enhanced validation to ensure this is the radar chart
          const hasRadarElements = element.querySelector('g[class*="recharts-radar"]') || 
                                   element.querySelector('g[class*="recharts-polar"]') ||
                                   element.querySelector('polygon') ||
                                   element.querySelector('path[d*="M"]');
          
          // Additional check: ensure it's inside a radar chart container
          const isInRadarContainer = element.closest('[data-testid="radar-chart-container"]') || 
                                     element.closest('.radar-chart-container');
          
          // Size validation - radar chart should be reasonably sized
          const rect = element.getBoundingClientRect();
          const hasReasonableSize = rect.width > 200 && rect.height > 200;
          
          if (hasRadarElements && isInRadarContainer && hasReasonableSize) {
            chartElement = element;
            console.log('ChartCapture: Found valid radar chart SVG with selector:', selector);
            console.log('ChartCapture: SVG validation:', {
              hasRadarElements: !!hasRadarElements,
              isInRadarContainer: !!isInRadarContainer,
              hasReasonableSize,
              dimensions: { width: rect.width, height: rect.height }
            });
            break;
          } else {
            console.log('ChartCapture: SVG found but failed validation with selector:', selector, {
              hasRadarElements: !!hasRadarElements,
              isInRadarContainer: !!isInRadarContainer,
              hasReasonableSize,
              dimensions: rect.width > 0 ? { width: rect.width, height: rect.height } : 'no dimensions'
            });
          }
        }
      }
      
      // If no specific radar chart found, try a more targeted approach
      if (!chartElement) {
        console.log('ChartCapture: No radar chart found with standard selectors, trying targeted approach...');
        
        // Look specifically for radar chart containers first
        const radarContainers = document.querySelectorAll('[data-testid="radar-chart-container"], .radar-chart-container');
        console.log('ChartCapture: Found', radarContainers.length, 'radar chart containers');
        
        for (const container of radarContainers) {
          const svgInContainer = container.querySelector('svg');
          if (svgInContainer) {
            const rect = svgInContainer.getBoundingClientRect();
            if (rect.width > 200 && rect.height > 200) {
              chartElement = svgInContainer as SVGElement;
              console.log('ChartCapture: Using SVG from radar container as fallback');
              break;
            }
          }
        }
      }
      
      if (!chartElement) {
        console.warn('ChartCapture: No valid radar chart SVG element found. Available elements:');
        selectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          console.log(`ChartCapture: ${selector} found ${found.length} elements`);
        });
        
        // Debug: Show radar container structure
        const radarContainer = document.querySelector('[data-testid="radar-chart-container"]');
        if (radarContainer) {
          console.log('ChartCapture: Radar container structure:', {
            innerHTML: radarContainer.innerHTML.substring(0, 500),
            children: Array.from(radarContainer.children).map(child => ({
              tagName: child.tagName,
              className: child.className,
              id: child.id
            }))
          });
        } else {
          console.log('ChartCapture: No radar container found with data-testid="radar-chart-container"');
        }
        
        resolve(null);
        return;
      }
      
      try {
        // Get the SVG's computed styles and dimensions
        const svgRect = chartElement.getBoundingClientRect();
        const svgWidth = svgRect.width || parseInt(chartElement.getAttribute('width') || '480');
        const svgHeight = svgRect.height || parseInt(chartElement.getAttribute('height') || '350');
        
        console.log('ChartCapture: Using radar chart SVG with dimensions:', { svgWidth, svgHeight });
        console.log('ChartCapture: SVG bounding rect:', svgRect);
        
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
            console.log('ChartCapture: Successfully captured radar chart as PNG with wider dimensions');
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
