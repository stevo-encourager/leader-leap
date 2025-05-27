
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

  // Create visual preview popup with loading state
  const createPreviewPopup = (content: HTMLElement, title: string, hasContent: boolean) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      position: relative;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ccc;
    `;
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = hasContent ? title : 'PDF Preview - Content Loading...';
    titleEl.style.cssText = 'margin: 0; color: #333; font-size: 18px;';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close Preview';
    closeBtn.style.cssText = `
      background: #dc2626;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    const proceedBtn = document.createElement('button');
    proceedBtn.textContent = hasContent ? 'Generate PDF with this content' : 'Content not ready - Cannot generate PDF';
    proceedBtn.disabled = !hasContent;
    proceedBtn.style.cssText = `
      background: ${hasContent ? '#2F564D' : '#999'};
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: ${hasContent ? 'pointer' : 'not-allowed'};
      font-size: 14px;
      margin-left: 10px;
    `;
    
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      background: #f9f9f9;
      font-family: monospace;
      font-size: 10px;
      max-height: 70vh;
      overflow: auto;
    `;
    
    if (!hasContent) {
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 18px; margin-bottom: 10px;">⏳ Waiting for content to load...</div>
          <div style="font-size: 12px;">Charts, insights, and dynamic content are still rendering.</div>
          <div style="font-size: 12px; margin-top: 10px;">Please wait a moment and try again.</div>
        </div>
      `;
    } else {
      const clonedContent = content.cloneNode(true) as HTMLElement;
      contentContainer.appendChild(clonedContent);
    }
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    header.appendChild(proceedBtn);
    popup.appendChild(header);
    popup.appendChild(contentContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    return new Promise<boolean>((resolve) => {
      proceedBtn.onclick = () => {
        if (hasContent) {
          document.body.removeChild(overlay);
          resolve(true);
        }
      };
      closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve(false);
      };
    });
  };

  // Enhanced content validation
  const validateContent = (element: HTMLElement): { hasContent: boolean; details: any } => {
    console.log('PDF: Starting comprehensive content validation...');
    
    const details = {
      charts: 0,
      aiInsights: { length: 0, hasContent: false },
      profileSummary: { length: 0, hasContent: false },
      recommendedSteps: { length: 0, hasContent: false },
      coachingSupport: { length: 0, hasContent: false },
      totalTextContent: 0,
      images: { total: 0, loaded: 0 }
    };
    
    // Check for charts (SVG elements)
    const charts = element.querySelectorAll('svg, .recharts-wrapper, .recharts-container, canvas');
    details.charts = charts.length;
    console.log(`PDF: Found ${charts.length} chart elements`);
    
    // Check for AI insights content with multiple selectors
    const aiInsightsSelectors = [
      '[data-section="detailed-analysis"]',
      '.ai-insights',
      '[class*="ai"]',
      '[class*="insight"]'
    ];
    
    let aiInsightsContent = '';
    for (const selector of aiInsightsSelectors) {
      const aiElement = element.querySelector(selector);
      if (aiElement) {
        const content = aiElement.textContent?.trim() || '';
        if (content.length > aiInsightsContent.length) {
          aiInsightsContent = content;
        }
      }
    }
    
    details.aiInsights.length = aiInsightsContent.length;
    details.aiInsights.hasContent = aiInsightsContent.length > 200; // Substantial content
    console.log(`PDF: AI insights content length: ${aiInsightsContent.length}`);
    
    // Check other sections
    const profileSummary = element.querySelector('[data-section="profile-summary"]')?.textContent?.trim() || '';
    details.profileSummary.length = profileSummary.length;
    details.profileSummary.hasContent = profileSummary.length > 50;
    
    const recommendedSteps = element.querySelector('[data-section="recommended-steps"]')?.textContent?.trim() || '';
    details.recommendedSteps.length = recommendedSteps.length;
    details.recommendedSteps.hasContent = recommendedSteps.length > 100;
    
    const coachingSupport = element.querySelector('[data-section="coaching-support"]')?.textContent?.trim() || '';
    details.coachingSupport.length = coachingSupport.length;
    details.coachingSupport.hasContent = coachingSupport.length > 50;
    
    // Check total text content
    details.totalTextContent = element.textContent?.trim().length || 0;
    
    // Check images
    const images = element.querySelectorAll('img');
    details.images.total = images.length;
    details.images.loaded = Array.from(images).filter(img => img.complete && img.naturalHeight > 0).length;
    
    console.log('PDF: Content validation details:', details);
    
    // Determine if we have sufficient content
    const hasSubstantialContent = (
      details.charts > 0 &&
      details.aiInsights.hasContent &&
      details.profileSummary.hasContent &&
      details.recommendedSteps.hasContent &&
      details.coachingSupport.hasContent &&
      details.totalTextContent > 500 &&
      details.images.loaded === details.images.total
    );
    
    console.log(`PDF: Has substantial content: ${hasSubstantialContent}`);
    
    return { hasContent: hasSubstantialContent, details };
  };

  // Wait for dynamic content with progressive checking
  const waitForDynamicContent = (): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('PDF: Starting progressive content wait...');
      
      let attempts = 0;
      const maxAttempts = 30; // 15 seconds max wait
      
      const checkContent = () => {
        attempts++;
        console.log(`PDF: Content check attempt ${attempts}/${maxAttempts}`);
        
        const validation = validateContent(element);
        
        if (validation.hasContent) {
          console.log('PDF: All content ready!');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log('PDF: Max attempts reached, proceeding with current content');
          resolve(false);
          return;
        }
        
        // Wait longer intervals for content to load
        setTimeout(checkContent, 500);
      };
      
      // Start checking after a brief initial delay
      setTimeout(checkContent, 1000);
    });
  };

  const createComprehensivePDFContent = async () => {
    console.log('PDF: Creating comprehensive PDF content');
    
    // Get the main results container
    const resultsContent = document.getElementById('results-content');
    if (!resultsContent) {
      throw new Error('Results content container not found');
    }
    
    // Create PDF container with proper styling
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 210mm;
      min-height: 297mm;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1f2937;
      padding: 20mm;
      box-sizing: border-box;
      line-height: 1.5;
      font-size: 12px;
    `;

    // Add header with logo
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2F564D;
    `;
    
    const logo = document.createElement('img');
    logo.src = '/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png';
    logo.style.cssText = 'height: 60px; width: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;';
    logo.crossOrigin = 'anonymous';
    
    const title = document.createElement('h1');
    title.textContent = 'Leadership Assessment Results';
    title.style.cssText = `
      color: #2F564D;
      font-size: 24px;
      margin: 10px 0 0 0;
      font-weight: 600;
    `;
    
    header.appendChild(logo);
    header.appendChild(title);
    pdfContainer.appendChild(header);

    // Clone and clean the main content
    const contentClone = resultsContent.cloneNode(true) as HTMLElement;
    
    // Enhanced content cleaning for PDF
    const cleanForPDF = (element: HTMLElement) => {
      // Remove interactive elements and navigation
      const toRemove = element.querySelectorAll('button, .cursor-pointer, nav, header:not(.card-header), footer, [role="button"]');
      toRemove.forEach(el => el.remove());
      
      // Ensure all elements are visible and styled for PDF
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        
        // Force visibility
        if (htmlEl.style.display === 'none' || htmlEl.style.visibility === 'hidden') {
          htmlEl.style.display = 'block';
          htmlEl.style.visibility = 'visible';
        }
        
        // Remove problematic CSS
        htmlEl.style.transform = 'none';
        htmlEl.style.transition = 'none';
        htmlEl.style.animation = 'none';
        
        // Ensure text is visible
        const computedStyle = window.getComputedStyle(htmlEl);
        if (computedStyle.color === 'transparent' || computedStyle.color === 'rgba(0, 0, 0, 0)') {
          htmlEl.style.color = '#1f2937';
        }
        
        // Fix backgrounds
        if (computedStyle.backgroundColor === 'transparent') {
          htmlEl.style.backgroundColor = 'white';
        }
      });
      
      // Handle charts specifically
      const svgElements = element.querySelectorAll('svg');
      svgElements.forEach(svg => {
        svg.style.cssText += `
          max-width: 100% !important;
          height: 400px !important;
          display: block !important;
          margin: 20px auto !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
        `;
      });
      
      // Expand any collapsed content
      const hiddenElements = element.querySelectorAll('.hidden, [aria-expanded="false"]');
      hiddenElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove('hidden');
        htmlEl.style.display = 'block';
        htmlEl.removeAttribute('aria-expanded');
      });
      
      // Style specific sections for PDF
      const sections = element.querySelectorAll('[data-section]');
      sections.forEach(section => {
        const htmlSection = section as HTMLElement;
        htmlSection.style.cssText += `
          margin-bottom: 25px !important;
          page-break-inside: avoid !important;
          background: white !important;
          padding: 15px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
        `;
      });
    };
    
    cleanForPDF(contentClone);
    
    // Apply final styling to the cloned content
    contentClone.style.cssText = `
      background: white;
      color: #1f2937;
      font-size: 12px;
      line-height: 1.5;
    `;
    
    pdfContainer.appendChild(contentClone);
    
    return pdfContainer;
  };

  // Main export process with proper content waiting
  const startExport = async () => {
    toast({
      title: "Preparing PDF Export",
      description: "Waiting for all content to load...",
    });

    // Wait for dynamic content to load
    const contentReady = await waitForDynamicContent();
    
    // Validate content before proceeding
    const validation = validateContent(element);
    
    console.log('PDF: Content validation result:', validation);
    
    // Create PDF content
    const pdfContent = await createComprehensivePDFContent();
    document.body.appendChild(pdfContent);
    
    // Show preview and wait for user confirmation
    const shouldProceed = await createPreviewPopup(
      pdfContent, 
      'PDF Content Preview - Verify this looks correct', 
      validation.hasContent
    );
    
    if (!shouldProceed) {
      document.body.removeChild(pdfContent);
      if (!validation.hasContent) {
        toast({
          title: "PDF Export Delayed",
          description: "Content is still loading. Please wait a moment and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "PDF Export Cancelled",
          description: "PDF generation was cancelled by user",
        });
      }
      return;
    }
    
    if (!validation.hasContent) {
      document.body.removeChild(pdfContent);
      toast({
        title: "PDF Export Failed",
        description: "Content is not ready yet. Please wait for all sections to load and try again.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Generating PDF",
      description: "Creating your PDF file...",
    });
    
    // PDF generation options
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
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff',
        foreignObjectRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      }
    };
    
    // Generate PDF with error handling
    try {
      await html2pdf().set(opt).from(pdfContent).save();
      
      toast({
        title: "PDF Export Successful",
        description: "Your leadership assessment results have been downloaded",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clean up
      if (document.body.contains(pdfContent)) {
        document.body.removeChild(pdfContent);
      }
    }
  };

  // Start the export process
  startExport().catch((error) => {
    console.error('PDF export process error:', error);
    toast({
      title: "PDF Export Failed",
      description: "Failed to prepare content for PDF export",
      variant: "destructive",
    });
  });
};
