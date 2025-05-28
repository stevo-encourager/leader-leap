
import jsPDF from 'jspdf';
import { Category, Demographics } from './assessmentTypes';
import { calculateAverageGap } from './assessmentCalculations/averages';
import { generateResourceLink } from './resourceMapping';

// Use the uploaded Encourager logo
const COMPANY_LOGO_URL = '/lovable-uploads/db40277e-6ff0-437e-acf2-faaa2d92671e.png';

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resource: string;
}

interface KeyStrength {
  competency: string;
  example: string;
  leverage_advice: string[];
}

interface AIInsightsData {
  summary: string;
  priority_areas: PriorityArea[];
  key_strengths: KeyStrength[];
}

// Helper function to convert image URL to Base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('PDF Export: Converting logo to Base64:', url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('PDF Export: Could not get canvas context');
            reject(new Error('Could not get canvas context'));
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          console.log('PDF Export: Logo converted to Base64 successfully');
          resolve(base64);
        } catch (error) {
          console.error('PDF Export: Error converting logo to canvas:', error);
          reject(error);
        }
      };
      img.onerror = (error) => {
        console.error('PDF Export: Error loading logo image:', error);
        reject(new Error('Failed to load logo image'));
      };
      img.src = url;
    } catch (error) {
      console.error('PDF Export: Error in imageToBase64:', error);
      reject(error);
    }
  });
};

// Enhanced radar chart capture with proper element detection and SVG conversion
const captureRadarChart = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      console.log('PDF Export: Starting enhanced radar chart capture');
      
      // Wait longer for chart to fully render
      setTimeout(() => {
        // Try multiple possible selectors for the radar chart
        const selectors = [
          '#pdf-radar-chart-container canvas',
          '#pdf-radar-chart-container svg',
          '.radar-chart-container canvas',
          '.radar-chart-container svg',
          '.recharts-surface',
          'svg.recharts-surface',
          '.recharts-wrapper svg',
          '.recharts-container svg',
          '[data-testid="radar-chart"] canvas',
          '[data-testid="radar-chart"] svg'
        ];
        
        let chartElement: HTMLElement | null = null;
        let usedSelector = '';
        
        for (const selector of selectors) {
          chartElement = document.querySelector(selector);
          if (chartElement) {
            usedSelector = selector;
            console.log('PDF Export: Found chart element with selector:', selector);
            break;
          }
        }
        
        if (!chartElement) {
          console.warn('PDF Export: No radar chart element found with any selector');
          resolve(null);
          return;
        }
        
        try {
          if (chartElement.tagName.toLowerCase() === 'canvas') {
            // Direct canvas element
            console.log('PDF Export: Processing canvas chart element');
            const canvas = chartElement as HTMLCanvasElement;
            
            // Ensure canvas has content
            if (canvas.width === 0 || canvas.height === 0) {
              console.warn('PDF Export: Canvas has zero dimensions');
              resolve(null);
              return;
            }
            
            const dataUrl = canvas.toDataURL('image/png');
            
            // Validate the data URL
            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
              console.warn('PDF Export: Canvas produced empty or invalid data URL');
              resolve(null);
              return;
            }
            
            console.log('PDF Export: Canvas chart captured successfully, data length:', dataUrl.length);
            resolve(dataUrl);
            
          } else if (chartElement.tagName.toLowerCase() === 'svg') {
            // SVG element - convert to canvas
            console.log('PDF Export: Processing SVG chart element');
            const svg = chartElement as unknown as SVGElement;
            
            // Get SVG dimensions
            const rect = svg.getBoundingClientRect();
            const svgWidth = rect.width || 400;
            const svgHeight = rect.height || 400;
            
            console.log('PDF Export: SVG dimensions:', { width: svgWidth, height: svgHeight });
            
            // Create canvas for conversion
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              console.warn('PDF Export: Could not get canvas context for SVG conversion');
              resolve(null);
              return;
            }
            
            // Set canvas size to match SVG
            canvas.width = svgWidth;
            canvas.height = svgHeight;
            
            // Serialize SVG to string
            const svgData = new XMLSerializer().serializeToString(svg);
            console.log('PDF Export: SVG serialized, length:', svgData.length);
            
            // Create image from SVG data
            const img = new Image();
            
            img.onload = () => {
              try {
                // Clear canvas and draw SVG
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                
                const dataUrl = canvas.toDataURL('image/png');
                
                // Validate the data URL
                if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
                  console.warn('PDF Export: SVG conversion produced empty or invalid data URL');
                  resolve(null);
                  return;
                }
                
                console.log('PDF Export: SVG chart converted to image successfully, data length:', dataUrl.length);
                
                // Clean up blob URL
                URL.revokeObjectURL(img.src);
                resolve(dataUrl);
              } catch (error) {
                console.error('PDF Export: Error drawing SVG to canvas:', error);
                URL.revokeObjectURL(img.src);
                resolve(null);
              }
            };
            
            img.onerror = () => {
              console.warn('PDF Export: Failed to convert SVG to image');
              URL.revokeObjectURL(img.src);
              resolve(null);
            };
            
            // Create blob URL for SVG
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            img.src = url;
            
          } else {
            console.warn('PDF Export: Chart element is neither canvas nor SVG, type:', chartElement.tagName);
            resolve(null);
          }
        } catch (error) {
          console.error('PDF Export: Error capturing chart with selector', usedSelector, ':', error);
          resolve(null);
        }
      }, 2000); // Increased wait time for chart to render
    } catch (error) {
      console.error('PDF Export: Error in captureRadarChart:', error);
      resolve(null);
    }
  });
};

// Helper function to check if text will exceed page bounds
const checkPageBreak = (doc: jsPDF, yPosition: number, additionalHeight: number = 20): boolean => {
  const pageHeight = doc.internal.pageSize.getHeight();
  return yPosition + additionalHeight > pageHeight - 20;
};

// Helper function to add text with page break handling
const addTextWithPageBreak = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  yPosition: number, 
  maxWidth: number,
  fontSize: number = 12
): number => {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  
  for (let i = 0; i < lines.length; i++) {
    if (checkPageBreak(doc, yPosition)) {
      doc.addPage();
      yPosition = 15; // Reset to top margin
    }
    doc.text(lines[i], x, yPosition);
    yPosition += 6;
  }
  
  return yPosition;
};

export const generatePDFWithJsPDF = async (
  categories: Category[],
  demographics: Demographics,
  insights: string,
  filename: string
): Promise<void> => {
  console.log('PDF Export: Starting jsPDF generation...');
  
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Get logo image as Base64
    let logoBase64: string | null = null;
    try {
      logoBase64 = await imageToBase64(COMPANY_LOGO_URL);
      console.log('PDF Export: Logo converted to Base64 successfully');
    } catch (error) {
      console.error('PDF Export: Failed to load logo image:', error);
    }

    // Capture radar chart with enhanced detection
    console.log('PDF Export: Attempting to capture radar chart...');
    const chartDataUrl = await captureRadarChart();
    if (chartDataUrl) {
      console.log('PDF Export: Radar chart captured successfully');
    } else {
      console.warn('PDF Export: Failed to capture radar chart - will show placeholder text');
    }

    // PAGE 1 - Header and Profile
    
    // Add logo at the very top
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 60, 20);
        console.log('PDF Export: Logo added to PDF');
      } catch (error) {
        console.error('PDF Export: Error adding logo to PDF:', error);
      }
    }
    yPosition += 30;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Leadership Assessment Results', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Profile Summary
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Profile Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    if (demographics?.role) {
      doc.text(`Role: ${demographics.role}`, margin, yPosition);
      yPosition += 8;
    }
    if (demographics?.yearsOfExperience) {
      doc.text(`Years of Experience: ${demographics.yearsOfExperience}`, margin, yPosition);
      yPosition += 8;
    }
    if (demographics?.industry) {
      doc.text(`Industry: ${demographics.industry}`, margin, yPosition);
      yPosition += 8;
    }

    const averageGap = calculateAverageGap(categories);
    doc.text(`Overall Development Gap: ${averageGap.toFixed(2)} points`, margin, yPosition);
    yPosition += 8;
    doc.text(`Assessment completed across ${categories.length} competency areas`, margin, yPosition);
    yPosition += 20;

    // Competency Analysis section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Competency Analysis - Radar Chart', margin, yPosition);
    yPosition += 15;

    // Add radar chart if captured, otherwise show meaningful message
    if (chartDataUrl) {
      try {
        doc.addImage(chartDataUrl, 'PNG', margin, yPosition, contentWidth, 100);
        console.log('PDF Export: Radar chart added to PDF');
        yPosition += 110;
      } catch (error) {
        console.error('PDF Export: Error adding radar chart to PDF:', error);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Error: Radar chart could not be rendered in PDF', margin, yPosition);
        yPosition += 15;
      }
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Radar chart visualization shows your current vs desired competency levels', margin, yPosition);
      doc.text('across all assessment categories. The chart could not be captured for this PDF.', margin, yPosition + 6);
      yPosition += 25;
    }

    // PAGE 2 - AI Insights (start on new page)
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Powered Insights', margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Personalized leadership development insights powered by Encourager GPT', margin, yPosition);
    yPosition += 15;

    // Parse and display insights
    if (insights) {
      try {
        const parsedInsights: AIInsightsData = JSON.parse(insights);

        // Assessment Summary
        if (parsedInsights.summary) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Assessment Summary', margin, yPosition);
          yPosition += 8;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          yPosition = addTextWithPageBreak(doc, parsedInsights.summary, margin, yPosition, contentWidth);
          yPosition += 10;
        }

        // Priority Development Areas
        if (parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0) {
          // Check if we need a new page
          if (checkPageBreak(doc, yPosition, 40)) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top 3 Priority Development Areas', margin, yPosition);
          yPosition += 10;

          parsedInsights.priority_areas.forEach((area, index) => {
            // Check if we need a new page for this section
            if (checkPageBreak(doc, yPosition, 30)) {
              doc.addPage();
              yPosition = margin;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${area.competency} (Gap: ${area.gap.toFixed(1)})`, margin, yPosition);
            yPosition += 8;

            doc.setFont('helvetica', 'normal');
            doc.text('Key insights:', margin, yPosition);
            yPosition += 6;

            if (area.insights && Array.isArray(area.insights)) {
              area.insights.forEach((insight) => {
                yPosition = addTextWithPageBreak(doc, `• ${insight}`, margin + 5, yPosition, contentWidth - 10);
              });
            }

            // Add recommended resource
            if (area.resource) {
              const resourceLink = generateResourceLink(area.resource);
              doc.setFont('helvetica', 'bold');
              yPosition = addTextWithPageBreak(doc, 'Recommended Resource:', margin, yPosition, contentWidth);
              doc.setFont('helvetica', 'normal');
              yPosition = addTextWithPageBreak(doc, resourceLink.title, margin + 5, yPosition, contentWidth - 10);
              yPosition += 12;
            }
          });
        }

        // Key Competencies to Leverage
        if (parsedInsights.key_strengths && parsedInsights.key_strengths.length > 0) {
          // Check if we need a new page
          if (checkPageBreak(doc, yPosition, 50)) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Key Competencies to Leverage', margin, yPosition);
          yPosition += 10;

          parsedInsights.key_strengths.forEach((strength) => {
            // Check if we need a new page for this section
            if (checkPageBreak(doc, yPosition, 25)) {
              doc.addPage();
              yPosition = margin;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            yPosition = addTextWithPageBreak(doc, `Competency: ${strength.competency}`, margin, yPosition, contentWidth);

            doc.setFont('helvetica', 'normal');
            yPosition = addTextWithPageBreak(doc, `Existing Skill: ${strength.example}`, margin, yPosition, contentWidth);

            yPosition = addTextWithPageBreak(doc, 'How to leverage further:', margin, yPosition, contentWidth);

            if (strength.leverage_advice && Array.isArray(strength.leverage_advice)) {
              strength.leverage_advice.forEach((advice) => {
                yPosition = addTextWithPageBreak(doc, `• ${advice}`, margin + 5, yPosition, contentWidth - 10);
              });
            }
            yPosition += 8;
          });
        }

      } catch (error) {
        console.error('PDF Export: Error parsing insights:', error);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('AI insights could not be parsed', margin, yPosition);
      }
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('AI insights are being generated...', margin, yPosition);
    }

    // Add remaining sections on new page if needed
    if (checkPageBreak(doc, yPosition, 60)) {
      doc.addPage();
      yPosition = margin;
    } else {
      yPosition += 15;
    }

    // Recommended Next Steps
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommended Next Steps', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const nextSteps = [
      'Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development',
      'Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress',
      'Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step'
    ];

    nextSteps.forEach((step) => {
      yPosition = addTextWithPageBreak(doc, `• ${step}`, margin + 5, yPosition, contentWidth - 10);
      yPosition += 4;
    });

    yPosition += 10;

    // Coaching Support
    if (checkPageBreak(doc, yPosition, 40)) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Development Coaching', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Ready to take your leadership skills to the next level? Our expert coaches can help you:', margin, yPosition);
    yPosition += 8;

    const coachingBenefits = [
      'Create personalized development plans',
      'Practice new skills in a safe environment',
      'Overcome specific leadership challenges',
      'Track your progress over time'
    ];

    coachingBenefits.forEach((benefit) => {
      doc.text(`• ${benefit}`, margin + 5, yPosition);
      yPosition += 6;
    });

    // Footer
    yPosition = pageHeight - 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Leadership Assessment Tool • Generated on ' + currentDate, pageWidth / 2, yPosition, { align: 'center' });
    doc.text('This assessment is designed to help you identify development opportunities and create targeted improvement plans.', pageWidth / 2, yPosition + 5, { align: 'center' });

    // Save the PDF
    doc.save(filename);
    console.log('PDF Export: PDF generated and downloaded successfully');

  } catch (error) {
    console.error('PDF Export: Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
