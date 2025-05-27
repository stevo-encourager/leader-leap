
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

  // Create debugging output container
  const createDebugOutput = (content: string, title: string) => {
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #333;
      padding: 20px;
      max-width: 80vw;
      max-height: 80vh;
      overflow: auto;
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Debug';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: red;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => document.body.removeChild(debugDiv);
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 10px 0; color: #333;';
    
    const contentEl = document.createElement('pre');
    contentEl.textContent = content;
    contentEl.style.cssText = 'white-space: pre-wrap; margin: 0;';
    
    debugDiv.appendChild(closeBtn);
    debugDiv.appendChild(titleEl);
    debugDiv.appendChild(contentEl);
    document.body.appendChild(debugDiv);
  };

  toast({
    title: "Generating PDF",
    description: "Creating your complete assessment results...",
  });

  // Comprehensive content detection
  const findContent = () => {
    console.log('=== PDF DEBUG: Starting content detection ===');
    
    // Try multiple selectors for different sections
    const selectors = [
      // Main content container
      '#results-content',
      '[data-section="profile-summary"]',
      '[data-section="detailed-analysis"]', 
      '[data-section="recommended-steps"]',
      '[data-section="coaching-support"]',
      
      // Fallback selectors
      '.space-y-6',
      '[role="main"]',
      'main',
      
      // Component-specific selectors
      '.recharts-wrapper',
      'svg',
      '.bg-encourager\\/5',
      '.grid.grid-cols-3.gap-4'
    ];
    
    const foundElements: { [key: string]: Element[] } = {};
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      foundElements[selector] = Array.from(elements);
      console.log(`PDF DEBUG: Selector "${selector}" found ${elements.length} elements`);
    });
    
    // Show debug info
    const debugInfo = Object.entries(foundElements)
      .map(([selector, elements]) => `${selector}: ${elements.length} elements`)
      .join('\n');
    
    createDebugOutput(debugInfo, 'Content Detection Results');
    
    return foundElements;
  };

  // Wait for content to be fully rendered
  const waitForContent = () => {
    return new Promise<void>((resolve) => {
      // Wait for charts and dynamic content
      setTimeout(() => {
        // Check if charts are rendered
        const charts = document.querySelectorAll('svg, .recharts-wrapper');
        console.log(`PDF DEBUG: Found ${charts.length} chart elements`);
        
        // Check if images are loaded
        const images = document.querySelectorAll('img');
        let loadedImages = 0;
        
        if (images.length === 0) {
          resolve();
          return;
        }
        
        images.forEach(img => {
          if (img.complete) {
            loadedImages++;
          } else {
            img.onload = () => {
              loadedImages++;
              if (loadedImages === images.length) {
                resolve();
              }
            };
            img.onerror = () => {
              loadedImages++;
              if (loadedImages === images.length) {
                resolve();
              }
            };
          }
        });
        
        if (loadedImages === images.length) {
          resolve();
        }
      }, 2000);
    });
  };

  const createPDFContent = async () => {
    // First, wait for all content to load
    await waitForContent();
    
    // Find all content
    const foundElements = findContent();
    
    // Create main PDF container
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1f2937;
      padding: 15mm;
      box-sizing: border-box;
      line-height: 1.4;
    `;

    // Add header with logo
    const headerSection = document.createElement('div');
    headerSection.style.cssText = `
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2F564D;
    `;
    
    const logo = document.createElement('img');
    logo.src = '/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png';
    logo.style.cssText = 'height: 50px; width: auto; margin-bottom: 10px;';
    logo.crossOrigin = 'anonymous';
    headerSection.appendChild(logo);
    
    const title = document.createElement('h1');
    title.textContent = 'Leadership Assessment Results';
    title.style.cssText = `
      color: #2F564D;
      font-size: 20px;
      margin: 0;
      font-weight: 600;
    `;
    headerSection.appendChild(title);
    
    pdfContainer.appendChild(headerSection);

    // Try to get the main results content
    const mainContent = document.getElementById('results-content');
    
    if (mainContent) {
      console.log('PDF DEBUG: Found main results content');
      
      // Clone the entire content
      const contentClone = mainContent.cloneNode(true) as HTMLElement;
      
      // Clean up the clone for PDF
      cleanElementForPDF(contentClone);
      
      // Add to PDF container
      contentClone.style.cssText = `
        background: white;
        color: #1f2937;
        font-size: 12px;
        line-height: 1.4;
      `;
      
      pdfContainer.appendChild(contentClone);
      
      // Show what we captured
      createDebugOutput(contentClone.innerHTML.substring(0, 2000) + '...', 'Captured Content Preview');
      
    } else {
      console.log('PDF DEBUG: Main content not found, trying fallback');
      
      // Fallback: try to find individual sections
      const sections = [
        'profile-summary',
        'detailed-analysis', 
        'recommended-steps',
        'coaching-support'
      ];
      
      let foundSections = 0;
      
      sections.forEach(sectionName => {
        const section = document.querySelector(`[data-section="${sectionName}"]`);
        if (section) {
          console.log(`PDF DEBUG: Found section: ${sectionName}`);
          foundSections++;
          
          const sectionClone = section.cloneNode(true) as HTMLElement;
          cleanElementForPDF(sectionClone);
          
          sectionClone.style.cssText += `
            margin: 15px 0;
            page-break-inside: avoid;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
          `;
          
          pdfContainer.appendChild(sectionClone);
        }
      });
      
      if (foundSections === 0) {
        // Last resort: capture the entire body content
        console.log('PDF DEBUG: No sections found, capturing body');
        const bodyClone = document.body.cloneNode(true) as HTMLElement;
        cleanElementForPDF(bodyClone);
        pdfContainer.appendChild(bodyClone);
      }
      
      createDebugOutput(`Found ${foundSections} sections out of ${sections.length}`, 'Section Detection Results');
    }

    return pdfContainer;
  };

  const cleanElementForPDF = (element: HTMLElement) => {
    // Remove interactive elements
    const interactiveElements = element.querySelectorAll('button, [role="button"], .cursor-pointer, nav, header, footer');
    interactiveElements.forEach(el => el.remove());

    // Fix all elements
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      
      // Ensure visibility
      htmlEl.style.display = htmlEl.style.display === 'none' ? 'block' : htmlEl.style.display;
      htmlEl.style.visibility = 'visible';
      htmlEl.style.opacity = '1';
      
      // Fix colors
      if (window.getComputedStyle(htmlEl).color === 'transparent') {
        htmlEl.style.color = '#1f2937';
      }
      
      // Remove problematic styles
      htmlEl.style.transition = 'none';
      htmlEl.style.transform = 'none';
      htmlEl.style.animation = 'none';
    });

    // Handle SVG charts
    const svgElements = element.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.style.cssText = `
        max-width: 100% !important;
        height: 300px !important;
        display: block !important;
        margin: 10px auto !important;
        background: white !important;
      `;
    });

    // Expand collapsed content
    const collapsedElements = element.querySelectorAll('[aria-expanded="false"], .collapsed, .hidden');
    collapsedElements.forEach(collapsed => {
      const htmlCollapsed = collapsed as HTMLElement;
      htmlCollapsed.style.display = 'block';
      htmlCollapsed.style.visibility = 'visible';
      htmlCollapsed.removeAttribute('aria-expanded');
      htmlCollapsed.classList.remove('collapsed', 'hidden');
    });
  };

  // Enhanced PDF configuration
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { 
      type: 'jpeg', 
      quality: 0.95
    },
    html2canvas: { 
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: true,
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    }
  };
  
  // Create and process PDF content
  createPDFContent().then(pdfContent => {
    document.body.appendChild(pdfContent);
    
    console.log('PDF DEBUG: PDF content created, element count:', pdfContent.children.length);
    console.log('PDF DEBUG: PDF content HTML length:', pdfContent.innerHTML.length);
    
    // Show final HTML being sent to PDF generator
    createDebugOutput(pdfContent.outerHTML.substring(0, 3000) + '...', 'Final PDF HTML');
    
    // Generate PDF after a longer delay to ensure everything is ready
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
        
        // Show error details
        createDebugOutput(error.toString(), 'PDF Generation Error');
        
        // Clean up on error
        if (document.body.contains(pdfContent)) {
          document.body.removeChild(pdfContent);
        }
        
        toast({
          title: "Export failed",
          description: "There was an issue generating the PDF. Check the debug output for details.",
          variant: "destructive",
        });
      });
    }, 4000);
  });
};
