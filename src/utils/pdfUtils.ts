
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';
import { Category, Demographics } from './assessmentTypes';

export const exportToPDF = (categories: Category[], demographics: Demographics, filename: string = 'leadership-assessment-results.pdf') => {
  console.log('PDF: Starting simplified PDF export with template approach');
  
  // Import PDFTemplate dynamically to avoid circular dependencies
  import('../components/pdf/PDFTemplate').then(({ default: PDFTemplate }) => {
    // Create React element
    const React = require('react');
    const ReactDOM = require('react-dom/client');
    
    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      background: white;
      z-index: -1;
    `;
    
    document.body.appendChild(tempContainer);
    
    // Create PDF template element
    const pdfElement = React.createElement(PDFTemplate, {
      categories,
      demographics
    });
    
    // Render the template
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pdfElement);
    
    // Wait a moment for rendering, then generate PDF
    setTimeout(() => {
      toast({
        title: "Generating PDF",
        description: "Creating your assessment results PDF...",
      });
      
      const opt = {
        margin: [15, 15, 15, 15],
        filename,
        image: { 
          type: 'jpeg', 
          quality: 0.98
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          width: 794,
          height: 1123,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
      
      html2pdf().set(opt).from(tempContainer).save().then(() => {
        toast({
          title: "PDF Export Successful",
          description: "Your leadership assessment results have been downloaded",
        });
        
        // Clean up
        document.body.removeChild(tempContainer);
      }).catch((error) => {
        console.error('PDF generation error:', error);
        toast({
          title: "PDF Export Failed",
          description: "There was an error generating the PDF. Please try again.",
          variant: "destructive",
        });
        
        // Clean up
        document.body.removeChild(tempContainer);
      });
    }, 1000);
  }).catch((error) => {
    console.error('Error importing PDFTemplate:', error);
    toast({
      title: "PDF Export Failed",
      description: "Could not load the PDF template.",
      variant: "destructive",
    });
  });
};
