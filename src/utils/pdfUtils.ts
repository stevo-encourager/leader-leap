
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';

export const exportToPDF = (elementId: string, filename: string, onSuccess?: () => void) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast({
      title: "Export failed",
      description: "Could not find the element to export",
      variant: "destructive",
    });
    return;
  }

  // Enhanced PDF configuration for comprehensive content capture
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { 
      type: 'jpeg', 
      quality: 0.98 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight + 100, // Add extra height for dynamic content
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight + 100,
      foreignObjectRendering: true, // Better SVG/chart rendering
      ignoreElements: (el) => {
        // Skip elements that might cause rendering issues
        return el.classList?.contains('no-pdf') || false;
      }
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.no-page-break'
    }
  };
  
  toast({
    title: "Generating PDF",
    description: "Your complete assessment results are being prepared for download...",
  });
  
  // Extended delay to ensure all dynamic content including charts and tabs are fully rendered
  setTimeout(() => {
    // Ensure all tabs and dynamic content are visible for PDF capture
    const tabElements = element.querySelectorAll('[role="tabpanel"]');
    const originalDisplayStates: string[] = [];
    
    // Temporarily show all tab content for PDF generation
    tabElements.forEach((tab, index) => {
      const htmlTab = tab as HTMLElement;
      originalDisplayStates[index] = htmlTab.style.display;
      htmlTab.style.display = 'block';
    });
    
    // Force a comprehensive reflow
    const htmlElement = element as HTMLElement;
    htmlElement.style.display = 'none';
    element.offsetHeight; // Trigger reflow
    htmlElement.style.display = '';
    
    // Wait a bit more for charts to render
    setTimeout(() => {
      html2pdf().set(opt).from(element).save().then(() => {
        // Restore original tab states
        tabElements.forEach((tab, index) => {
          const htmlTab = tab as HTMLElement;
          htmlTab.style.display = originalDisplayStates[index] || '';
        });
        
        toast({
          title: "Download complete",
          description: "Your complete leadership assessment results have been saved as PDF",
        });
        if (onSuccess) onSuccess();
      }).catch((error) => {
        console.error('PDF generation error:', error);
        
        // Restore original tab states on error
        tabElements.forEach((tab, index) => {
          const htmlTab = tab as HTMLElement;
          htmlTab.style.display = originalDisplayStates[index] || '';
        });
        
        toast({
          title: "Export failed",
          description: "There was an issue generating the PDF. Please try again.",
          variant: "destructive",
        });
      });
    }, 500);
  }, 1500); // Increased delay for comprehensive content rendering
};
