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

// Enhanced helper function to convert image URL to Base64 with better error handling
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('PDF Export: Converting logo to Base64:', url);
      
      // Use fetch to get the image
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            console.log('PDF Export: Logo converted to Base64 successfully');
            resolve(base64);
          };
          reader.onerror = () => {
            console.error('PDF Export: FileReader error');
            reject(new Error('FileReader failed'));
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('PDF Export: Fetch error:', error);
          reject(error);
        });
    } catch (error) {
      console.error('PDF Export: Error in imageToBase64:', error);
      reject(error);
    }
  });
};

// Enhanced SVG-to-canvas conversion with style inlining (from working minimal test)
const svgToCanvas = (svgElement: SVGElement): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      // Clone the SVG to avoid modifying the original
      const svgClone = svgElement.cloneNode(true) as SVGElement;
      
      // Get computed styles for all elements
      const getAllComputedStyles = (element: Element): string => {
        const computedStyle = window.getComputedStyle(element);
        let styleString = '';
        
        // Important style properties for SVG rendering
        const importantProps = [
          'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity',
          'font-family', 'font-size', 'font-weight', 'color', 'text-anchor',
          'dominant-baseline', 'transform'
        ];
        
        importantProps.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none') {
            styleString += `${prop}:${value};`;
          }
        });
        
        return styleString;
      };
      
      // Apply computed styles inline to all elements
      const applyInlineStyles = (element: Element) => {
        const styles = getAllComputedStyles(element);
        if (styles) {
          element.setAttribute('style', styles);
        }
        
        // Recursively apply to children
        Array.from(element.children).forEach(child => {
          applyInlineStyles(child);
        });
      };
      
      // Apply styles to cloned SVG
      applyInlineStyles(svgClone);
      
      // Get dimensions
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width || 400;
      const height = rect.height || 400;
      
      // Set explicit dimensions on cloned SVG
      svgClone.setAttribute('width', width.toString());
      svgClone.setAttribute('height', height.toString());
      svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Add necessary namespaces
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      
      console.log('PDF Export: SVG Clone dimensions:', { width, height });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('PDF Export: Could not get canvas context');
        resolve(null);
        return;
      }
      
      // Set canvas size with device pixel ratio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      // Create image from styled SVG
      const img = new Image();
      
      img.onload = () => {
        try {
          console.log('PDF Export: Image loaded successfully');
          
          // Clear canvas with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          
          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          console.log('PDF Export: PNG dataURL generated successfully, length:', dataUrl.length);
          
          URL.revokeObjectURL(img.src);
          resolve(dataUrl);
        } catch (error) {
          console.error('PDF Export: Error drawing image to canvas:', error);
          URL.revokeObjectURL(img.src);
          resolve(null);
        }
      };
      
      img.onerror = (error) => {
        console.error('PDF Export: Image load failed:', error);
        URL.revokeObjectURL(img.src);
        resolve(null);
      };
      
      // Convert SVG to blob URL
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      
      console.log('PDF Export: SVG blob created, loading image...');
      img.src = blobUrl;
      
    } catch (error) {
      console.error('PDF Export: Error in svgToCanvas:', error);
      resolve(null);
    }
  });
};

// Enhanced chart capture function using the working logic from minimal test
const captureRadarChart = (): Promise<string | null> => {
  return new Promise((resolve) => {
    console.log('PDF Export: === ENHANCED CHART CAPTURE START ===');
    
    // Wait for chart to render
    setTimeout(async () => {
      try {
        // Find the recharts SVG
        const chartSvg = document.querySelector('.recharts-surface') as SVGElement;
        
        if (!chartSvg) {
          console.error('PDF Export: No recharts SVG found');
          resolve(null);
          return;
        }
        
        console.log('PDF Export: Found chart SVG:', {
          tagName: chartSvg.tagName,
          className: chartSvg.className,
          children: chartSvg.children.length
        });
        
        // Use enhanced SVG-to-canvas conversion (same as working minimal test)
        const dataUrl = await svgToCanvas(chartSvg);
        
        if (dataUrl) {
          console.log('PDF Export: ✅ Chart captured successfully with enhanced method');
        } else {
          console.error('PDF Export: ❌ Enhanced chart capture failed');
        }
        
        resolve(dataUrl);
        
      } catch (error) {
        console.error('PDF Export: Error in enhanced chart capture:', error);
        resolve(null);
      }
      
      console.log('PDF Export: === ENHANCED CHART CAPTURE END ===');
    }, 3000);
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
  console.log('PDF Export: === STARTING PDF GENERATION WITH ENHANCED CHART CAPTURE ===');
  
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
      console.log('PDF Export: Logo converted successfully');
    } catch (error) {
      console.error('PDF Export: Failed to load logo:', error);
    }

    // Capture radar chart with enhanced method (same as working minimal test)
    console.log('PDF Export: Starting enhanced radar chart capture...');
    const chartDataUrl = await captureRadarChart();
    
    if (chartDataUrl) {
      console.log('PDF Export: ✅ Radar chart captured successfully');
      console.log('PDF Export: Chart data preview:', chartDataUrl.substring(0, 100));
    } else {
      console.error('PDF Export: ❌ Failed to capture radar chart');
    }

    // PAGE 1 - Header and Profile
    
    // Add logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 60, 20);
        console.log('PDF Export: Logo added to PDF');
      } catch (error) {
        console.error('PDF Export: Error adding logo:', error);
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

    // Add radar chart with enhanced error handling
    if (chartDataUrl) {
      try {
        console.log('PDF Export: Adding enhanced chart to PDF...');
        
        // Test the data URL first
        if (!chartDataUrl.startsWith('data:image/')) {
          throw new Error('Invalid chart data URL format');
        }
        
        // Add the chart image
        doc.addImage(chartDataUrl, 'PNG', margin, yPosition, contentWidth, 100);
        console.log('PDF Export: ✅ Enhanced radar chart added to PDF successfully');
        yPosition += 110;
        
      } catch (error) {
        console.error('PDF Export: ❌ Error adding enhanced radar chart to PDF:', error);
        
        // Add error message in PDF
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('❌ Radar Chart Rendering Error', margin, yPosition);
        doc.text('The radar chart could not be captured for PDF export.', margin, yPosition + 6);
        doc.text('Please view the interactive chart in the web application.', margin, yPosition + 12);
        doc.text(`Error: ${error.message}`, margin, yPosition + 18);
        yPosition += 30;
      }
    } else {
      console.log('PDF Export: No chart data available, adding placeholder');
      
      // Add placeholder message in PDF
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('❌ Radar Chart Not Available', margin, yPosition);
      doc.text('The radar chart could not be captured for PDF export.', margin, yPosition + 6);
      doc.text('This may be due to timing or rendering issues.', margin, yPosition + 12);
      doc.text('Please view the interactive chart in the web application.', margin, yPosition + 18);
      yPosition += 30;
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
          if (checkPageBreak(doc, yPosition, 40)) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top 3 Priority Development Areas', margin, yPosition);
          yPosition += 10;

          parsedInsights.priority_areas.forEach((area, index) => {
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
          if (checkPageBreak(doc, yPosition, 50)) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Key Competencies to Leverage', margin, yPosition);
          yPosition += 10;

          parsedInsights.key_strengths.forEach((strength) => {
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

    // Add remaining sections
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
    console.log('PDF Export: === PDF GENERATION WITH ENHANCED CHART CAPTURE COMPLETE ===');

  } catch (error) {
    console.error('PDF Export: Fatal error generating PDF with enhanced chart capture:', error);
    throw new Error('Failed to generate PDF');
  }
};
