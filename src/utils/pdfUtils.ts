
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

  toast({
    title: "Generating PDF",
    description: "Creating your complete assessment results...",
  });

  // Create a comprehensive PDF layout
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
      line-height: 1.4;
    `;

    // Add logo and header
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2F564D;
    `;
    
    const logo = document.createElement('img');
    logo.src = '/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png';
    logo.style.cssText = 'height: 60px; width: auto; margin-bottom: 15px;';
    logo.crossOrigin = 'anonymous';
    headerSection.appendChild(logo);
    
    const title = document.createElement('h1');
    title.textContent = 'Leadership Assessment Results';
    title.style.cssText = `
      color: #2F564D;
      font-size: 24px;
      margin: 0;
      font-weight: 600;
    `;
    headerSection.appendChild(title);
    
    pdfContainer.appendChild(headerSection);

    // Extract and add profile summary
    const profileElement = document.querySelector('[data-section="profile-summary"]') || 
                          document.querySelector('h3:contains("Your Profile")') ||
                          document.querySelector('.bg-slate-50');
    if (profileElement) {
      const profileClone = profileElement.cloneNode(true) as HTMLElement;
      const profileSection = createPDFSection('Your Profile', profileClone);
      pdfContainer.appendChild(profileSection);
    }

    // Extract and add radar chart
    const chartElement = document.querySelector('[data-section="detailed-analysis"]') ||
                        document.querySelector('.recharts-wrapper') ||
                        document.querySelector('svg');
    if (chartElement) {
      const chartSection = document.createElement('div');
      chartSection.style.cssText = 'margin: 25px 0; page-break-inside: avoid;';
      
      const chartTitle = document.createElement('h2');
      chartTitle.textContent = 'Competency Analysis - Radar Chart';
      chartTitle.style.cssText = `
        color: #2F564D;
        font-size: 18px;
        margin: 0 0 15px 0;
        font-weight: 600;
      `;
      chartSection.appendChild(chartTitle);
      
      // Try to capture the chart
      const chartClone = chartElement.cloneNode(true) as HTMLElement;
      chartClone.style.cssText = `
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        max-width: 100%;
        height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      chartSection.appendChild(chartClone);
      pdfContainer.appendChild(chartSection);
    }

    // Extract and add key insights
    const insightsElement = document.querySelector('[role="tabpanel"]') ||
                           document.querySelector('.bg-encourager\\/5') ||
                           document.querySelector('h2:contains("Skills & Competencies")');
    if (insightsElement) {
      const insightsClone = insightsElement.cloneNode(true) as HTMLElement;
      const insightsSection = createPDFSection('Key Insights & Development Opportunities', insightsClone);
      pdfContainer.appendChild(insightsSection);
    }

    // Extract and add recommended steps
    const stepsElement = document.querySelector('[data-section="recommended-steps"]') ||
                        document.querySelector('h3:contains("Recommended Next Steps")');
    if (stepsElement) {
      const stepsClone = stepsElement.cloneNode(true) as HTMLElement;
      const stepsSection = createPDFSection('Recommended Next Steps', stepsClone);
      pdfContainer.appendChild(stepsSection);
    }

    // Extract and add coaching support
    const coachingElement = document.querySelector('[data-section="coaching-support"]') ||
                           document.querySelector('h3:contains("expert coaching support")');
    if (coachingElement) {
      const coachingClone = coachingElement.cloneNode(true) as HTMLElement;
      const coachingSection = createPDFSection('Expert Coaching Support', coachingClone);
      pdfContainer.appendChild(coachingSection);
    }

    // Clean up all cloned content for PDF
    cleanElementForPDF(pdfContainer);

    return pdfContainer;
  };

  const createPDFSection = (title: string, content: HTMLElement) => {
    const section = document.createElement('div');
    section.style.cssText = `
      margin: 25px 0;
      page-break-inside: avoid;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    `;
    
    const sectionTitle = document.createElement('h2');
    sectionTitle.textContent = title;
    sectionTitle.style.cssText = `
      color: #2F564D;
      font-size: 18px;
      margin: 0 0 15px 0;
      font-weight: 600;
    `;
    section.appendChild(sectionTitle);
    section.appendChild(content);
    
    return section;
  };

  const cleanElementForPDF = (element: HTMLElement) => {
    // Remove all interactive elements
    const interactiveElements = element.querySelectorAll('button, [role="button"], .cursor-pointer');
    interactiveElements.forEach(el => el.remove());

    // Ensure all text is visible and readable
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      
      // Fix visibility issues
      if (htmlEl.style.display === 'none' || htmlEl.style.visibility === 'hidden') {
        htmlEl.style.display = 'block';
        htmlEl.style.visibility = 'visible';
      }
      
      // Ensure readable colors
      if (window.getComputedStyle(htmlEl).color === 'transparent' || 
          htmlEl.style.color === 'transparent') {
        htmlEl.style.color = '#1f2937';
      }
      
      // Fix background colors
      htmlEl.style.background = htmlEl.style.background || 'transparent';
      
      // Remove hover effects and transitions
      htmlEl.style.transition = 'none';
      htmlEl.style.transform = 'none';
    });

    // Handle SVG elements (charts)
    const svgElements = element.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.style.cssText += `
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 10px auto !important;
      `;
    });

    // Expand any collapsed content
    const tabPanels = element.querySelectorAll('[role="tabpanel"]');
    tabPanels.forEach(panel => {
      const htmlPanel = panel as HTMLElement;
      htmlPanel.style.display = 'block !important';
      htmlPanel.style.visibility = 'visible !important';
    });

    // Handle lists and structured content
    const lists = element.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const htmlList = list as HTMLElement;
      htmlList.style.cssText += `
        margin: 10px 0 !important;
        padding-left: 20px !important;
      `;
    });
  };

  // Enhanced PDF configuration for better rendering
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
      logging: true, // Enable logging for debugging
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
      foreignObjectRendering: true
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
  
  // Create the PDF content
  const pdfContent = createPDFContent();
  document.body.appendChild(pdfContent);
  
  // Add debugging information
  console.log('PDF Content created:', pdfContent);
  console.log('PDF Content children:', pdfContent.children.length);
  console.log('PDF Content HTML length:', pdfContent.innerHTML.length);
  
  // Wait longer for all content to load, especially images and charts
  setTimeout(() => {
    html2pdf().set(opt).from(pdfContent).save().then(() => {
      // Clean up
      if (document.body.contains(pdfContent)) {
        document.body.removeChild(pdfContent);
      }
      
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
  }, 3000); // Longer delay to ensure all content is rendered
};
