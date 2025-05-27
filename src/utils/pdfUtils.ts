
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';
import { Category, Demographics } from './assessmentTypes';

// Function to clean HTML content for PDF generation
const cleanHtmlForPdf = (element: HTMLElement): void => {
  console.log('PDF Export: Cleaning HTML content for PDF generation...');
  
  // Remove all data-lov-* attributes that interfere with PDF generation
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const attributes = Array.from(el.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('data-lov-') || 
          attr.name.startsWith('data-component-') ||
          attr.name === 'data-lov-id' ||
          attr.name === 'data-lov-name') {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  console.log('PDF Export: HTML cleaning completed');
};

// CRITICAL: Enhanced content readiness check function
const waitForContentToLoad = async (container: HTMLElement, maxWaitTime: number = 15000): Promise<boolean> => {
  console.log('PDF Export: Starting content readiness check...');
  
  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 50; // Check every 300ms for up to 15 seconds
  
  while (attempts < maxAttempts && (Date.now() - startTime) < maxWaitTime) {
    attempts++;
    console.log(`PDF Export: Content check attempt ${attempts}/${maxAttempts}`);
    
    // Check for required sections
    const profileSummary = container.querySelector('[data-section="profile-summary"]');
    const detailedAnalysis = container.querySelector('[data-section="detailed-analysis"]');
    const recommendedSteps = container.querySelector('[data-section="recommended-steps"]');
    const coachingSupport = container.querySelector('[data-section="coaching-support"]');
    
    console.log('PDF Export: Section presence check:', {
      profileSummary: !!profileSummary,
      detailedAnalysis: !!detailedAnalysis,
      recommendedSteps: !!recommendedSteps,
      coachingSupport: !!coachingSupport
    });
    
    // Check for AI insights specifically
    const aiInsightsContainer = container.querySelector('.bg-encourager\\/5');
    const aiInsightsContent = container.querySelector('.prose.prose-slate');
    const isLoadingIndicator = container.querySelector('.animate-pulse');
    const hasInsightsText = container.textContent?.includes('Assessment Summary') || 
                           container.textContent?.includes('Priority Development Areas') ||
                           container.textContent?.includes('Key Competencies to Leverage');
    
    console.log('PDF Export: AI Insights check:', {
      aiInsightsContainer: !!aiInsightsContainer,
      aiInsightsContent: !!aiInsightsContent,
      isLoadingIndicator: !!isLoadingIndicator,
      hasInsightsText: hasInsightsText,
      contentLength: container.textContent?.length || 0
    });
    
    // Check for skill gap chart
    const skillGapChart = container.querySelector('svg') || container.querySelector('canvas') || container.querySelector('.recharts-wrapper');
    console.log('PDF Export: Chart presence:', !!skillGapChart);
    
    // Content is ready if:
    // 1. All main sections are present
    // 2. AI insights are loaded (no loading indicator and has insights text)
    // 3. Content has substantial text (more than 3000 characters typically)
    // 4. Chart is present
    const sectionsReady = !!(profileSummary && detailedAnalysis && recommendedSteps && coachingSupport);
    const insightsReady = !isLoadingIndicator && hasInsightsText && aiInsightsContent;
    const contentSubstantial = (container.textContent?.length || 0) > 3000;
    const chartReady = !!skillGapChart;
    
    const allReady = sectionsReady && insightsReady && contentSubstantial && chartReady;
    
    console.log('PDF Export: Readiness status:', {
      sectionsReady,
      insightsReady,
      contentSubstantial,
      chartReady,
      allReady,
      textLength: container.textContent?.length || 0
    });
    
    if (allReady) {
      console.log('PDF Export: All content is ready for PDF generation');
      return true;
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.warn('PDF Export: Content readiness check timed out or max attempts reached');
  console.log('PDF Export: Final content state:', {
    textLength: container.textContent?.length || 0,
    hasAnyContent: (container.textContent?.length || 0) > 1000,
    innerHTML: container.innerHTML.substring(0, 500) + '...'
  });
  
  // Return true if we have at least some substantial content, even if not perfect
  return (container.textContent?.length || 0) > 1000;
};

export const exportToPDF = async (
  categories: Category[], 
  demographics: Demographics, 
  insights?: string,
  assessmentId?: string,
  filename: string = 'leadership-assessment-results.pdf'
) => {
  console.log('=== PDF EXPORT DEBUG START ===');
  console.log('PDF Export: Function called with parameters:');
  console.log('- categories type:', typeof categories);
  console.log('- categories is array:', Array.isArray(categories));
  console.log('- categories length:', categories?.length || 0);
  console.log('- demographics type:', typeof demographics);
  console.log('- demographics keys:', demographics ? Object.keys(demographics) : 'none');
  console.log('- insights provided:', !!insights);
  console.log('- insights length:', insights?.length || 0);
  console.log('- assessmentId for consistent data:', assessmentId);
  
  // Enhanced validation with detailed logging
  if (!categories) {
    console.error('PDF Export: Categories is null/undefined');
    toast({
      title: "PDF Export Failed",
      description: "No assessment data provided - categories is null/undefined",
      variant: "destructive",
    });
    return;
  }
  
  if (!Array.isArray(categories)) {
    console.error('PDF Export: Categories is not an array, type is:', typeof categories);
    toast({
      title: "PDF Export Failed", 
      description: "Invalid assessment data format - categories is not an array",
      variant: "destructive",
    });
    return;
  }
  
  if (categories.length === 0) {
    console.error('PDF Export: Categories array is empty');
    toast({
      title: "PDF Export Failed",
      description: "No assessment categories found - please complete an assessment first",
      variant: "destructive",
    });
    return;
  }
  
  // Detailed analysis of categories data
  console.log('PDF Export: Analyzing categories data in detail...');
  let totalSkills = 0;
  let skillsWithRatings = 0;
  let totalRatingValues = 0;
  
  categories.forEach((category, catIndex) => {
    console.log(`PDF Export: Category ${catIndex}:`, {
      id: category?.id,
      title: category?.title,
      skillsCount: category?.skills?.length || 0
    });
    
    if (category && category.skills && Array.isArray(category.skills)) {
      totalSkills += category.skills.length;
      
      category.skills.forEach((skill, skillIndex) => {
        if (skill && skill.ratings) {
          const currentRating = skill.ratings.current;
          const desiredRating = skill.ratings.desired;
          
          if (typeof currentRating === 'number' && currentRating > 0) {
            totalRatingValues++;
          }
          if (typeof desiredRating === 'number' && desiredRating > 0) {
            totalRatingValues++;
          }
          
          if ((typeof currentRating === 'number' && currentRating > 0) || 
              (typeof desiredRating === 'number' && desiredRating > 0)) {
            skillsWithRatings++;
          }
        }
      });
    }
  });
  
  console.log('PDF Export: Data analysis complete:');
  console.log('- Total skills found:', totalSkills);
  console.log('- Skills with ratings:', skillsWithRatings);
  console.log('- Total rating values:', totalRatingValues);
  
  if (skillsWithRatings === 0 || totalRatingValues === 0) {
    console.error('PDF Export: No skills with valid ratings found');
    toast({
      title: "PDF Export Failed",
      description: `No completed ratings found. Found ${totalSkills} skills but ${skillsWithRatings} have ratings. Please complete the assessment with actual ratings first.`,
      variant: "destructive",
    });
    return;
  }

  // CRITICAL: Enhanced insights validation for consistent stored insights
  if (insights) {
    const placeholderTexts = [
      'analysing your assessment results',
      'analyzing your assessment results',
      'Encourager GPT is analyzing',
      'generating insights',
      'please wait'
    ];
    
    const hasPlaceholder = placeholderTexts.some(placeholder => 
      insights.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    if (hasPlaceholder) {
      console.error('PDF Export: Insights contain placeholder text, should use stored insights');
      toast({
        title: "Please Wait",
        description: "AI insights are still being generated. Please wait for them to complete before exporting.",
        variant: "default",
      });
      return;
    }
    
    console.log('PDF Export: Using stored insights for consistency - no placeholder text detected');
  }
  
  console.log('PDF Export: Data validation passed, proceeding with multi-page PDF generation...');
  
  try {
    // Import React and ReactDOM
    console.log('PDF Export: Importing React dependencies...');
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    
    // Import PDFTemplate component
    console.log('PDF Export: Importing PDF template...');
    const { default: PDFTemplate } = await import('../components/pdf/PDFTemplate');
    console.log('PDF Export: PDF template imported successfully');
    
    // Create temporary container - positioned off-screen during generation
    console.log('PDF Export: Creating temporary container for PDF generation...');
    const tempContainer = document.createElement('div');
    
    // Position off-screen but ensure it's properly sized for PDF generation
    tempContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: 0;
      width: 210mm;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: -1;
      visibility: hidden;
    `;
    
    document.body.appendChild(tempContainer);
    console.log('PDF Export: Temporary container created off-screen');
    
    toast({
      title: "Generating PDF",
      description: "Creating your complete assessment results PDF with AI insights across multiple pages...",
    });
    
    // Create PDF template element with explicit props INCLUDING assessmentId for consistency
    const templateProps = {
      categories: categories,
      demographics: demographics || {},
      assessmentId: assessmentId // CRITICAL: Pass assessmentId to ensure consistent insights
    };
    
    console.log('PDF Export: Template props prepared:', {
      categoriesLength: templateProps.categories.length,
      demographicsKeys: Object.keys(templateProps.demographics),
      assessmentIdProvided: !!templateProps.assessmentId
    });
    
    const pdfElement = React.createElement(PDFTemplate, templateProps);
    console.log('PDF Export: React element created with assessmentId for consistent insights');
    
    // Render the template into the container
    console.log('PDF Export: Starting React rendering...');
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pdfElement);
    console.log('PDF Export: React render initiated');
    
    // CRITICAL: Wait for all content to be fully loaded and ready
    console.log('PDF Export: Waiting for complete content loading (including AI insights)...');
    
    // Give initial render time to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Wait for content readiness with enhanced checking
    const contentReady = await waitForContentToLoad(tempContainer, 20000); // Extended to 20 seconds
    
    if (!contentReady) {
      console.error('PDF Export: Content failed to load properly within timeout');
      
      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);
      
      toast({
        title: "PDF Export Failed",
        description: "Content failed to load completely. Please ensure AI insights have finished loading and try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Additional buffer to ensure everything is stable
    console.log('PDF Export: Content is ready, adding stability buffer...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clean the HTML content for PDF generation
    console.log('PDF Export: Cleaning HTML for PDF generation...');
    cleanHtmlForPdf(tempContainer);
    
    // Log the content for debugging
    console.log('PDF Export: Final content validation...');
    console.log('PDF Export: Content length:', tempContainer.innerHTML.length);
    console.log('PDF Export: Content elements count:', tempContainer.children.length);
    console.log('PDF Export: Text content length:', tempContainer.textContent?.length || 0);
    
    if (tempContainer.innerHTML.length < 5000) {
      console.error('PDF Export: Insufficient content rendered');
      console.log('PDF Export: Content preview:', tempContainer.innerHTML.substring(0, 1000));
    }
    
    // Configure html2pdf options for multi-page support with improved settings
    console.log('PDF Export: Configuring html2pdf for multi-page output...');
    const opt = {
      margin: [15, 15, 15, 15], // Proper margins in mm
      filename,
      image: { 
        type: 'jpeg', 
        quality: 0.98
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        letterRendering: true,
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        backgroundColor: '#ffffff',
        removeContainer: false,
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        putOnlyUsedFonts: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.page-break-avoid'
      }
    };
    
    console.log('PDF Export: Starting multi-page PDF conversion with validated content...');
    await html2pdf().set(opt).from(tempContainer).save();
    console.log('PDF Export: Multi-page PDF generation completed successfully');
    
    toast({
      title: "PDF Export Successful",
      description: "Your complete leadership assessment results have been downloaded as a multi-page PDF",
    });
    
    // Clean up - remove the temporary container
    console.log('PDF Export: Cleaning up temporary container...');
    root.unmount();
    document.body.removeChild(tempContainer);
    console.log('=== PDF EXPORT DEBUG END ===');
    
  } catch (error) {
    console.error('=== PDF EXPORT ERROR ===');
    console.error('PDF generation error:', error);
    console.error('Error stack:', error.stack);
    console.error('=== PDF EXPORT ERROR END ===');
    
    toast({
      title: "PDF Export Failed",
      description: `Error generating PDF: ${error.message}. Check console for details.`,
      variant: "destructive",
    });
  }
};
