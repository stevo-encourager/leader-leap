
import html2pdf from 'html2pdf.js';
import { toast } from '@/hooks/use-toast';
import { Category, Demographics } from './assessmentTypes';

export const exportToPDF = async (categories: Category[], demographics: Demographics, filename: string = 'leadership-assessment-results.pdf') => {
  console.log('PDF: Starting dedicated template PDF export');
  
  // Debug: Log the data being passed to the template
  console.log('PDF: Categories data:', JSON.stringify(categories, null, 2));
  console.log('PDF: Demographics data:', JSON.stringify(demographics, null, 2));
  console.log('PDF: Categories count:', categories?.length || 0);
  
  // Validate that we have data to export
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.error('PDF: No categories data provided');
    toast({
      title: "PDF Export Failed",
      description: "No assessment data available to export. Please complete an assessment first.",
      variant: "destructive",
    });
    return;
  }
  
  // Count skills with ratings for validation
  let skillsWithData = 0;
  categories.forEach(category => {
    if (category && category.skills) {
      category.skills.forEach(skill => {
        if (skill && skill.ratings && 
           (skill.ratings.current > 0 || skill.ratings.desired > 0)) {
          skillsWithData++;
        }
      });
    }
  });
  
  console.log('PDF: Skills with rating data:', skillsWithData);
  
  if (skillsWithData === 0) {
    console.error('PDF: No skills with rating data found');
    toast({
      title: "PDF Export Failed",
      description: "No assessment ratings found. Please complete the assessment with actual ratings first.",
      variant: "destructive",
    });
    return;
  }
  
  try {
    // Import React and ReactDOM
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    
    // Import PDFTemplate component
    const { default: PDFTemplate } = await import('../components/pdf/PDFTemplate');
    
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
    
    toast({
      title: "Generating PDF",
      description: "Creating your assessment results PDF...",
    });
    
    // Create PDF template element with explicit props
    const templateProps = {
      categories: categories,
      demographics: demographics || {}
    };
    
    console.log('PDF: Template props being passed:', templateProps);
    
    const pdfElement = React.createElement(PDFTemplate, templateProps);
    
    // Render the template
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pdfElement);
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
    
    // Log the rendered content for debugging
    console.log('PDF: Rendered container content length:', tempContainer.innerHTML.length);
    console.log('PDF: Container has children:', tempContainer.children.length);
    
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
    
    await html2pdf().set(opt).from(tempContainer).save();
    
    toast({
      title: "PDF Export Successful",
      description: "Your leadership assessment results have been downloaded",
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    toast({
      title: "PDF Export Failed",
      description: "There was an error generating the PDF. Please try again.",
      variant: "destructive",
    });
  }
};
