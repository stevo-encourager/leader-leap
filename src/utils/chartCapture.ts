
import html2canvas from 'html2canvas';

// Enhanced function to capture radar chart as PNG with better error handling and timing
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting radar chart capture process...');
    
    // Wait longer for chart to fully render, especially for PDF generation
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart container...');
      
      // Try multiple selectors to find the chart
      const selectors = [
        '[data-testid="radar-chart-container"]',
        '[data-chart-type="radar"]',
        '.radar-chart-container',
        '.recharts-radar-chart'
      ];
      
      let radarContainer: HTMLElement | null = null;
      
      for (const selector of selectors) {
        radarContainer = document.querySelector(selector) as HTMLElement;
        if (radarContainer) {
          console.log(`ChartCapture: Found radar chart using selector: ${selector}`);
          break;
        }
      }
      
      if (!radarContainer) {
        console.warn('ChartCapture: No radar chart container found with any selector');
        console.log('ChartCapture: Available elements:', {
          totalElements: document.querySelectorAll('*').length,
          svgElements: document.querySelectorAll('svg').length,
          rechartsElements: document.querySelectorAll('[class*="recharts"]').length
        });
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Found radar chart container:', {
        element: radarContainer,
        className: radarContainer.className,
        offsetWidth: radarContainer.offsetWidth,
        offsetHeight: radarContainer.offsetHeight,
        isVisible: radarContainer.offsetWidth > 0 && radarContainer.offsetHeight > 0
      });
      
      // Ensure the container is visible
      if (radarContainer.offsetWidth === 0 || radarContainer.offsetHeight === 0) {
        console.error('ChartCapture: Chart container has zero dimensions');
        resolve(null);
        return;
      }
      
      try {
        // Wait a bit more for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use html2canvas with optimized settings for PDF generation
        const canvas = await html2canvas(radarContainer, {
          backgroundColor: '#ffffff',
          scale: 2, // High quality but not too large for PDF
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: radarContainer.offsetWidth,
          height: radarContainer.offsetHeight,
          scrollX: 0,
          scrollY: 0,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight
        });
        
        console.log('ChartCapture: html2canvas capture successful:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          area: canvas.width * canvas.height
        });
        
        // Convert to PNG data URL with high quality
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        console.log('ChartCapture: PNG data URL generated, length:', pngDataUrl.length);
        
        // Validate that we have substantial image data
        if (pngDataUrl.length > 2000) { // Increased threshold for more reliable validation
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
    }, 3000); // Increased wait time for better reliability
  });
};

// Test function to validate chart capture and download for verification
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
