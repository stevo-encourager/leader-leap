
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

// Enhanced helper function to convert image URL to Base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('PDF Export: Converting logo to Base64:', url);
      
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

// ISOLATED radar chart capture specifically for PDF export
const captureRadarChartForPDF = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      console.log('PDF Export: === ISOLATED RADAR CHART CAPTURE START ===');
      
      // Wait for chart to render completely
      setTimeout(() => {
        // Target only PDF-specific chart containers
        const pdfSelectors = [
          '.pdf-radar-chart svg',
          '.pdf-radar-chart canvas',
          '#pdf-radar-chart-container svg',
          '#pdf-radar-chart-container canvas'
        ];
        
        let chartElement: HTMLElement | null = null;
        let usedSelector = '';
        
        // Try PDF-specific selectors first
        for (const selector of pdfSelectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`PDF Export: PDF selector "${selector}" found ${elements.length} elements`);
          
          if (elements.length > 0) {
            chartElement = elements[0] as HTMLElement;
            usedSelector = selector;
            console.log('PDF Export: Found PDF chart element:', {
              selector: usedSelector,
              tagName: chartElement.tagName,
              id: chartElement.id,
              className: chartElement.className
            });
            break;
          }
        }
        
        // Fallback to general selectors but be more selective
        if (!chartElement) {
          const fallbackSelectors = [
            '.recharts-surface',
            'svg.recharts-surface'
          ];
          
          for (const selector of fallbackSelectors) {
            const elements = document.querySelectorAll(selector);
            console.log(`PDF Export: Fallback selector "${selector}" found ${elements.length} elements`);
            
            if (elements.length > 0) {
              // Find the largest element (likely the main chart)
              let largestElement = elements[0] as HTMLElement;
              let largestArea = 0;
              
              elements.forEach((el) => {
                const element = el as HTMLElement;
                const rect = element.getBoundingClientRect();
                const area = rect.width * rect.height;
                
                if (area > largestArea) {
                  largestArea = area;
                  largestElement = element;
                }
              });
              
              if (largestArea > 1000) {
                chartElement = largestElement;
                usedSelector = selector;
                console.log('PDF Export: Selected fallback chart element:', {
                  selector: usedSelector,
                  area: largestArea
                });
                break;
              }
            }
          }
        }
        
        if (!chartElement) {
          console.error('PDF Export: No chart element found for PDF export');
          resolve(null);
          return;
        }
        
        // Process the chart element
        if (chartElement.tagName.toLowerCase() === 'canvas') {
          console.log('PDF Export: Processing CANVAS element');
          const canvas = chartElement as HTMLCanvasElement;
          
          if (canvas.width === 0 || canvas.height === 0) {
            console.error('PDF Export: Canvas has zero dimensions');
            resolve(null);
            return;
          }
          
          try {
            const dataUrl = canvas.toDataURL('image/png');
            console.log('PDF Export: Canvas captured, length:', dataUrl.length);
            
            if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
              console.error('PDF Export: Canvas produced invalid data URL');
              resolve(null);
              return;
            }
            
            resolve(dataUrl);
          } catch (error) {
            console.error('PDF Export: Error capturing canvas:', error);
            resolve(null);
          }
          
        } else if (chartElement.tagName.toLowerCase() === 'svg') {
          console.log('PDF Export: Processing SVG element for PDF');
          const svg = chartElement as unknown as SVGElement;
          
          const rect = svg.getBoundingClientRect();
          const svgWidth = rect.width || 400;
          const svgHeight = rect.height || 400;
          
          console.log('PDF Export: SVG dimensions:', { width: svgWidth, height: svgHeight });
          
          if (svgWidth === 0 || svgHeight === 0) {
            console.error('PDF Export: SVG has zero dimensions');
            resolve(null);
            return;
          }
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error('PDF Export: Could not get canvas context');
            resolve(null);
            return;
          }
          
          canvas.width = svgWidth;
          canvas.height = svgHeight;
          
          try {
            // Enhanced SVG processing with style inlining
            const svgClone = svg.cloneNode(true) as SVGElement;
            
            // Get all computed styles and inline them
            const allElements = svgClone.querySelectorAll('*');
            allElements.forEach((element) => {
              const computedStyle = window.getComputedStyle(element as Element);
              let styleString = '';
              
              // Key style properties for charts
              const importantStyles = [
                'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
                'font-family', 'font-size', 'font-weight', 'text-anchor',
                'dominant-baseline', 'opacity', 'fill-opacity'
              ];
              
              importantStyles.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'initial' && value !== 'normal') {
                  styleString += `${prop}: ${value}; `;
                }
              });
              
              if (styleString) {
                (element as HTMLElement).style.cssText = styleString;
              }
            });
            
            // Create proper SVG with inlined styles
            const serializedSvg = new XMLSerializer().serializeToString(svgClone);
            const completeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">${svgClone.innerHTML}</svg>`;
            
            const img = new Image();
            
            img.onload = () => {
              try {
                console.log('PDF Export: SVG image loaded for PDF, drawing to canvas');
                
                // Clear canvas with white background
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the chart
                ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                
                const dataUrl = canvas.toDataURL('image/png');
                console.log('PDF Export: SVG conversion complete, length:', dataUrl.length);
                
                if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 100) {
                  console.error('PDF Export: SVG conversion produced invalid data URL');
                  resolve(null);
                  return;
                }
                
                URL.revokeObjectURL(img.src);
                resolve(dataUrl);
              } catch (error) {
                console.error('PDF Export: Error drawing SVG to canvas:', error);
                URL.revokeObjectURL(img.src);
                resolve(null);
              }
            };
            
            img.onerror = (error) => {
              console.error('PDF Export: SVG image load failed:', error);
              URL.revokeObjectURL(img.src);
              resolve(null);
            };
            
            const svgBlob = new Blob([completeSvg], { type: 'image/svg+xml;charset=utf-8' });
            const blobUrl = URL.createObjectURL(svgBlob);
            img.src = blobUrl;
            
          } catch (error) {
            console.error('PDF Export: Error processing SVG:', error);
            resolve(null);
          }
        } else {
          console.error('PDF Export: Chart element is neither canvas nor SVG:', chartElement.tagName);
          resolve(null);
        }
        
        console.log('PDF Export: === ISOLATED RADAR CHART CAPTURE END ===');
      }, 5000); // 5 second wait for chart rendering
    } catch (error) {
      console.error('PDF Export: Fatal error in captureRadarChartForPDF:', error);
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
      yPosition = 15;
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
  console.log('PDF Export: === STARTING ISOLATED PDF GENERATION ===');
  
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

    // Capture radar chart using isolated method
    console.log('PDF Export: Starting isolated radar chart capture...');
    const chartDataUrl = await captureRadarChartForPDF();
    
    if (chartDataUrl) {
      console.log('PDF Export: ✅ Radar chart captured successfully for PDF');
    } else {
      console.error('PDF Export: ❌ Failed to capture radar chart for PDF');
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

    // Add radar chart with comprehensive error handling
    if (chartDataUrl) {
      try {
        console.log('PDF Export: Adding isolated chart to PDF...');
        
        if (!chartDataUrl.startsWith('data:image/')) {
          throw new Error('Invalid chart data URL format');
        }
        
        doc.addImage(chartDataUrl, 'PNG', margin, yPosition, contentWidth, 100);
        console.log('PDF Export: ✅ Isolated radar chart added to PDF successfully');
        yPosition += 110;
        
      } catch (error) {
        console.error('PDF Export: ❌ Error adding radar chart to PDF:', error);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('❌ Radar Chart Rendering Error', margin, yPosition);
        doc.text('The radar chart could not be captured for PDF export.', margin, yPosition + 6);
        doc.text('Please view the interactive chart in the web application.', margin, yPosition + 12);
        yPosition += 30;
      }
    } else {
      console.log('PDF Export: No chart data available, adding placeholder');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('❌ Radar Chart Not Available', margin, yPosition);
      doc.text('The radar chart could not be captured for PDF export.', margin, yPosition + 6);
      doc.text('Please view the interactive chart in the web application.', margin, yPosition + 12);
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
    console.log('PDF Export: === ISOLATED PDF GENERATION COMPLETE ===');

  } catch (error) {
    console.error('PDF Export: Fatal error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
