
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

  // Enhanced PDF configuration for better content capture
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
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'] 
    }
  };
  
  toast({
    title: "Generating PDF",
    description: "Your results are being prepared for download...",
  });
  
  // Add a longer delay to ensure all content is fully rendered, including charts and dynamic content
  setTimeout(() => {
    // Force a reflow to ensure all content is rendered
    element.style.display = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.display = '';
    
    html2pdf().set(opt).from(element).save().then(() => {
      toast({
        title: "Download complete",
        description: "Your leadership assessment results have been saved as PDF",
      });
      if (onSuccess) onSuccess();
    }).catch((error) => {
      console.error('PDF generation error:', error);
      toast({
        title: "Export failed",
        description: "There was an issue generating the PDF. Please try again.",
        variant: "destructive",
      });
    });
  }, 1000); // Increased delay to ensure charts and dynamic content are rendered
};
