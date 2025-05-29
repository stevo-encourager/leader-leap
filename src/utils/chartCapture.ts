
import html2canvas from 'html2canvas';

// Enhanced function to capture radar chart as PNG using html2canvas with larger size
export const captureRadarChartAsPNG = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('ChartCapture: Starting direct DOM capture with html2canvas...');
    
    // Wait for chart to fully render
    setTimeout(async () => {
      console.log('ChartCapture: Looking for radar chart container...');
      
      const radarContainer = document.querySelector('[data-testid="radar-chart-container"]') as HTMLElement;
      
      if (!radarContainer) {
        console.warn('ChartCapture: No radar chart container found with data-testid="radar-chart-container"');
        resolve(null);
        return;
      }
      
      console.log('ChartCapture: Found radar chart container:', radarContainer);
      
      try {
        // Use html2canvas to capture the entire container as-is with larger output
        const canvas = await html2canvas(radarContainer, {
          backgroundColor: '#ffffff',
          scale: 3, // Increased scale for higher resolution and larger size
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: radarContainer.offsetWidth,
          height: radarContainer.offsetHeight,
        });
        
        console.log('ChartCapture: html2canvas capture successful:', {
          width: canvas.width,
          height: canvas.height,
          area: canvas.width * canvas.height
        });
        
        // Convert to PNG data URL
        const pngDataUrl = canvas.toDataURL('image/png', 1.0);
        console.log('ChartCapture: PNG data URL length:', pngDataUrl.length);
        
        // Validate that we have substantial image data
        if (pngDataUrl.length > 1000) {
          console.log('ChartCapture: Successfully captured radar chart using html2canvas');
          resolve(pngDataUrl);
        } else {
          console.error('ChartCapture: Generated PNG seems too small, might be empty');
          resolve(null);
        }
        
      } catch (error) {
        console.error('ChartCapture: Error capturing with html2canvas:', error);
        resolve(null);
      }
    }, 2000); // Wait for chart to fully render
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
