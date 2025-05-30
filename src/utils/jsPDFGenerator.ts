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
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Helper function to capture radar chart as image
const captureRadarChart = (): Promise<string | null> => {
  return new Promise((resolve) => {
    // Wait a bit for chart to fully render
    setTimeout(() => {
      // Try multiple possible selectors for the radar chart
      const selectors = [
        '.radar-chart-container canvas',
        '.recharts-surface',
        '[data-testid="radar-chart"] canvas',
        'svg.recharts-surface',
        '.recharts-wrapper svg'
      ];
      
      let chartElement: HTMLElement | null = null;
      
      for (const selector of selectors) {
        chartElement = document.querySelector(selector);
        if (chartElement) {
          console.log('Found chart element with selector:', selector);
          break;
        }
      }
      
      if (!chartElement) {
        console.warn('No radar chart element found');
        resolve(null);
        return;
      }
      
      try {
        if (chartElement.tagName.toLowerCase() === 'canvas') {
          // Direct canvas element
          const canvas = chartElement as HTMLCanvasElement;
          resolve(canvas.toDataURL('image/png'));
        } else if (chartElement.tagName.toLowerCase() === 'svg') {
          // SVG element - convert to canvas with proper type checking
          const svg = chartElement as unknown as SVGElement;
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          // Set canvas size to match SVG
          const rect = svg.getBoundingClientRect();
          canvas.width = rect.width || 400;
          canvas.height = rect.height || 400;
          
          img.onload = () => {
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          
          img.onerror = () => {
            console.warn('Failed to convert SVG to image');
            resolve(null);
          };
          
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          img.src = url;
        } else {
          console.warn('Chart element is neither canvas nor SVG');
          resolve(null);
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
        resolve(null);
      }
    }, 1000); // Wait 1 second for chart to render
  });
};

export const generatePDFWithJsPDF = async (
  categories: Category[],
  demographics: Demographics,
  insights: string,
  filename: string
): Promise<void> => {
  console.log('Starting jsPDF generation...');
  
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
      console.log('Logo converted to Base64 successfully');
    } catch (error) {
      console.error('Failed to load logo image:', error);
    }

    // Capture radar chart
    const chartDataUrl = await captureRadarChart();
    if (chartDataUrl) {
      console.log('Radar chart captured successfully');
    } else {
      console.warn('Failed to capture radar chart');
    }

    // PAGE 1 - Header and Profile
    
    // Add logo at the very top
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, yPosition, 60, 20);
        console.log('Logo added to PDF');
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }
    yPosition += 30;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Leader Leap Assessment Results', pageWidth / 2, yPosition, { align: 'center' });
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

    // Add radar chart if captured
    if (chartDataUrl) {
      try {
        doc.addImage(chartDataUrl, 'PNG', margin, yPosition, contentWidth, 100);
        console.log('Radar chart added to PDF');
        yPosition += 110;
      } catch (error) {
        console.error('Error adding radar chart to PDF:', error);
        doc.setFontSize(12);
        doc.text('Radar chart could not be captured', margin, yPosition);
        yPosition += 15;
      }
    } else {
      doc.setFontSize(12);
      doc.text('Radar chart visualization shows your current vs desired competency levels', margin, yPosition);
      yPosition += 15;
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
    doc.text('Personalized leadership development insights powered by EncouragerGPT', margin, yPosition);
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
          const summaryLines = doc.splitTextToSize(parsedInsights.summary, contentWidth);
          doc.text(summaryLines, margin, yPosition);
          yPosition += summaryLines.length * 6 + 10;
        }

        // Priority Development Areas
        if (parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0) {
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Top 3 Priority Development Areas', margin, yPosition);
          yPosition += 10;

          parsedInsights.priority_areas.forEach((area, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
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
                const insightLines = doc.splitTextToSize(`• ${insight}`, contentWidth - 10);
                doc.text(insightLines, margin + 5, yPosition);
                yPosition += insightLines.length * 6;
              });
            }

            // Add recommended resource
            if (area.resource) {
              const resourceLink = generateResourceLink(area.resource);
              doc.setFont('helvetica', 'bold');
              doc.text('Recommended Resource:', margin, yPosition);
              yPosition += 6;
              doc.setFont('helvetica', 'normal');
              doc.text(resourceLink.title, margin + 5, yPosition);
              yPosition += 12;
            }
          });
        }

        // Key Competencies to Leverage
        if (parsedInsights.key_strengths && parsedInsights.key_strengths.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = margin;
          }

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Key Competencies to Leverage', margin, yPosition);
          yPosition += 10;

          parsedInsights.key_strengths.forEach((strength) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = margin;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Competency: ${strength.competency}`, margin, yPosition);
            yPosition += 6;

            doc.setFont('helvetica', 'normal');
            doc.text(`Existing Skill: ${strength.example}`, margin, yPosition);
            yPosition += 6;

            doc.text('How to leverage further:', margin, yPosition);
            yPosition += 6;

            if (strength.leverage_advice && Array.isArray(strength.leverage_advice)) {
              strength.leverage_advice.forEach((advice) => {
                const adviceLines = doc.splitTextToSize(`• ${advice}`, contentWidth - 10);
                doc.text(adviceLines, margin + 5, yPosition);
                yPosition += adviceLines.length * 6;
              });
            }
            yPosition += 8;
          });
        }

      } catch (error) {
        console.error('Error parsing insights:', error);
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
    if (yPosition > pageHeight - 60) {
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
      const stepLines = doc.splitTextToSize(`• ${step}`, contentWidth - 10);
      doc.text(stepLines, margin + 5, yPosition);
      yPosition += stepLines.length * 6 + 4;
    });

    yPosition += 10;

    // Coaching Support
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
    doc.text('Leader Leap Assessment Tool • Generated on ' + currentDate, pageWidth / 2, yPosition, { align: 'center' });
    doc.text('This assessment is designed to help you identify development opportunities and create targeted improvement plans.', pageWidth / 2, yPosition + 5, { align: 'center' });

    // Save the PDF
    doc.save(filename);
    console.log('PDF generated and downloaded successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
