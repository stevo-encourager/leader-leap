
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

  // Create a temporary clone of the dashboard content for PDF rendering
  const createPDFContent = () => {
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1f2937;
      padding: 20mm;
      box-sizing: border-box;
    `;

    // Add logo at the top
    const logoSection = document.createElement('div');
    logoSection.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2F564D;
    `;
    
    const logo = document.createElement('img');
    logo.src = '/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png';
    logo.style.cssText = 'height: 60px; width: auto;';
    logoSection.appendChild(logo);
    
    const title = document.createElement('h1');
    title.textContent = 'Leadership Assessment Results';
    title.style.cssText = `
      color: #2F564D;
      font-size: 24px;
      margin: 15px 0 0 0;
      font-weight: 600;
    `;
    logoSection.appendChild(title);
    
    pdfContainer.appendChild(logoSection);

    // Clone and process each major section
    const sections = [
      { selector: '[data-section="profile-summary"]', title: 'Your Profile' },
      { selector: '[data-section="detailed-analysis"]', title: 'Competency Analysis' },
      { selector: '[data-section="recommended-steps"]', title: 'Recommended Next Steps' },
      { selector: '[data-section="coaching-support"]', title: 'Expert Coaching Support' }
    ];

    sections.forEach(({ selector, title }) => {
      const originalSection = document.querySelector(selector);
      if (originalSection) {
        const sectionClone = originalSection.cloneNode(true) as HTMLElement;
        
        // Add section title
        const sectionTitle = document.createElement('h2');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
          color: #2F564D;
          font-size: 18px;
          margin: 25px 0 15px 0;
          font-weight: 600;
          page-break-before: avoid;
        `;
        pdfContainer.appendChild(sectionTitle);
        
        // Clean up the cloned section for PDF
        cleanElementForPDF(sectionClone);
        pdfContainer.appendChild(sectionClone);
      }
    });

    // Handle tabs content specially - expand all tabs
    const tabPanels = pdfContainer.querySelectorAll('[role="tabpanel"]');
    tabPanels.forEach((panel) => {
      const htmlPanel = panel as HTMLElement;
      htmlPanel.style.display = 'block !important';
      htmlPanel.style.visibility = 'visible !important';
    });

    return pdfContainer;
  };

  const cleanElementForPDF = (element: HTMLElement) => {
    // Remove interactive elements and fix styles for PDF
    element.style.cssText += `
      background: white !important;
      box-shadow: none !important;
      border-radius: 8px !important;
      border: 1px solid #e2e8f0 !important;
      margin: 15px 0 !important;
      padding: 15px !important;
      page-break-inside: avoid;
    `;

    // Remove buttons and interactive elements
    const buttons = element.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    // Ensure text is readable
    const textElements = element.querySelectorAll('*');
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.color === 'transparent' || htmlEl.style.display === 'none') {
        htmlEl.style.color = '#1f2937';
        htmlEl.style.display = 'block';
      }
    });

    // Handle charts specially
    const charts = element.querySelectorAll('svg, canvas');
    charts.forEach(chart => {
      const htmlChart = chart as HTMLElement;
      htmlChart.style.cssText += `
        max-width: 100% !important;
        height: auto !important;
        margin: 10px auto !important;
        display: block !important;
      `;
    });
  };

  // Enhanced PDF configuration
  const opt = {
    margin: [15, 15, 15, 15],
    filename,
    image: { 
      type: 'jpeg', 
      quality: 0.95 
    },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['h1', 'h2', 'h3', '.no-page-break']
    }
  };
  
  toast({
    title: "Generating PDF",
    description: "Creating your complete assessment results...",
  });
  
  // Create the PDF content
  const pdfContent = createPDFContent();
  document.body.appendChild(pdfContent);
  
  // Wait for images and charts to load
  setTimeout(() => {
    html2pdf().set(opt).from(pdfContent).save().then(() => {
      // Clean up
      document.body.removeChild(pdfContent);
      
      toast({
        title: "Download complete",
        description: "Your leadership assessment results have been saved as PDF",
      });
      if (onSuccess) onSuccess();
    }).catch((error) => {
      console.error('PDF generation error:', error);
      
      // Clean up on error
      if (document.body.contains(pdfContent)) {
        document.body.removeChild(pdfContent);
      }
      
      toast({
        title: "Export failed",
        description: "There was an issue generating the PDF. Please try again.",
        variant: "destructive",
      });
    });
  }, 2000); // Give more time for content to render
};
