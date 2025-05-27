
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

export const exportToPDF = async (categories: Category[], demographics: Demographics, filename: string = 'leadership-assessment-results.pdf') => {
  console.log('=== PDF EXPORT DEBUG START ===');
  console.log('PDF Export: Function called with parameters:');
  console.log('- categories type:', typeof categories);
  console.log('- categories is array:', Array.isArray(categories));
  console.log('- categories length:', categories?.length || 0);
  console.log('- demographics type:', typeof demographics);
  console.log('- demographics keys:', demographics ? Object.keys(demographics) : 'none');
  
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
  
  console.log('PDF Export: Data validation passed, proceeding with PDF generation...');
  
  try {
    // Import React and ReactDOM
    console.log('PDF Export: Importing React dependencies...');
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    
    // Import PDFTemplate component
    console.log('PDF Export: Importing PDF template...');
    const { default: PDFTemplate } = await import('../components/pdf/PDFTemplate');
    console.log('PDF Export: PDF template imported successfully');
    
    // Create temporary container - INVISIBLE but still renderable
    console.log('PDF Export: Creating temporary container for PDF generation...');
    const tempContainer = document.createElement('div');
    
    // Use invisible but renderable positioning
    tempContainer.style.cssText = `
      position: fixed;
      top: -10000px;
      left: 0;
      width: 210mm;
      min-height: 297mm;
      background: white;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: -9999;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
    `;
    
    document.body.appendChild(tempContainer);
    console.log('PDF Export: Temporary container created and added to DOM');
    
    toast({
      title: "Generating PDF",
      description: "Creating your assessment results PDF...",
    });
    
    // Create PDF template element with explicit props
    const templateProps = {
      categories: categories,
      demographics: demographics || {}
    };
    
    console.log('PDF Export: Template props prepared:', {
      categoriesLength: templateProps.categories.length,
      demographicsKeys: Object.keys(templateProps.demographics)
    });
    
    const pdfElement = React.createElement(PDFTemplate, templateProps);
    console.log('PDF Export: React element created');
    
    // Render the template
    console.log('PDF Export: Starting React rendering...');
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pdfElement);
    console.log('PDF Export: React render initiated');
    
    // Wait for rendering to complete
    console.log('PDF Export: Waiting for render completion...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clean the HTML content for PDF generation
    console.log('PDF Export: Cleaning HTML for PDF generation...');
    cleanHtmlForPdf(tempContainer);
    
    // Log the cleaned content for debugging
    console.log('PDF Export: Checking cleaned content...');
    console.log('PDF Export: Container innerHTML length:', tempContainer.innerHTML.length);
    console.log('PDF Export: Container children count:', tempContainer.children.length);
    console.log('PDF Export: First 200 chars of cleaned content:', tempContainer.innerHTML.substring(0, 200));
    
    if (tempContainer.innerHTML.length < 1000) {
      console.error('PDF Export: Very little content rendered, potential rendering issue');
      console.log('PDF Export: Full container content:', tempContainer.innerHTML);
    }
    
    // Add timestamp marker to verify new code is running
    const timestamp = new Date().toISOString();
    console.log(`PDF Export: TIMESTAMP MARKER - PDF generation started at ${timestamp}`);
    
    console.log('PDF Export: Configuring html2pdf options...');
    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { 
        type: 'jpeg', 
        quality: 0.95
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: false,
        letterRendering: true,
        logging: false,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff',
        removeContainer: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    console.log('PDF Export: Starting html2pdf conversion...');
    await html2pdf().set(opt).from(tempContainer).save();
    console.log('PDF Export: PDF generation completed successfully');
    
    toast({
      title: "PDF Export Successful",
      description: "Your leadership assessment results have been downloaded",
    });
    
    // Clean up
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
