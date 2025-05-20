
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

  const opt = {
    margin: 10,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  toast({
    title: "Generating PDF",
    description: "Your results are being prepared for download...",
  });
  
  // Use setTimeout to allow the toast to render before PDF generation starts
  setTimeout(() => {
    html2pdf().set(opt).from(element).save().then(() => {
      toast({
        title: "Download complete",
        description: "Your leadership assessment results have been saved as PDF",
      });
      if (onSuccess) onSuccess();
    });
  }, 500);
};
