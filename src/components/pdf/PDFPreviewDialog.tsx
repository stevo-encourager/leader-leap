
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import PDFTemplate from './PDFTemplate';
import { toast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface PDFPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: () => void;
  categories: Category[];
  demographics: Demographics;
  assessmentId?: string;
}

const PDFPreviewDialog: React.FC<PDFPreviewDialogProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
  categories,
  demographics,
  assessmentId
}) => {
  const [isContentReady, setIsContentReady] = useState(false);
  const [contentCheckAttempts, setContentCheckAttempts] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if content is fully loaded when dialog opens
  useEffect(() => {
    if (!isOpen) {
      setIsContentReady(false);
      setContentCheckAttempts(0);
      return;
    }

    console.log('PDFPreview: Dialog opened, checking content readiness...');
    
    const checkContentReadiness = () => {
      const previewContainer = document.getElementById('pdf-preview-container');
      if (!previewContainer) {
        console.log('PDFPreview: Container not found, retrying...');
        return false;
      }

      const textContent = previewContainer.textContent || '';
      
      // Check for essential content
      const hasHeader = textContent.includes('Leadership Assessment Results');
      const hasProfile = textContent.includes('Profile Summary');
      const hasChart = textContent.includes('Competency Analysis');
      const hasAIInsights = textContent.includes('AI-Powered Insights');
      const hasAssessmentSummary = textContent.includes('Assessment Summary');
      const hasPriorityAreas = textContent.includes('Priority Development Areas');
      const hasKeyStrengths = textContent.includes('Key Competencies to Leverage');
      const hasRecommendedSteps = textContent.includes('Recommended Next Steps');
      const hasCoaching = textContent.includes('Professional Development Coaching');
      
      // Check for loading indicators
      const hasLoadingText = textContent.includes('analyzing your assessment results') || 
                             textContent.includes('generating insights');
      
      const contentLength = textContent.length;
      const hasSubstantialContent = contentLength > 4000;

      console.log('PDFPreview: Content check results:', {
        hasHeader,
        hasProfile,
        hasChart,
        hasAIInsights,
        hasAssessmentSummary,
        hasPriorityAreas,
        hasKeyStrengths,
        hasRecommendedSteps,
        hasCoaching,
        hasLoadingText,
        contentLength,
        hasSubstantialContent
      });

      const allContentReady = hasHeader && hasProfile && hasChart && 
                             hasAIInsights && hasAssessmentSummary && 
                             hasPriorityAreas && hasKeyStrengths && 
                             hasRecommendedSteps && hasCoaching && 
                             hasSubstantialContent && !hasLoadingText;

      return allContentReady;
    };

    const intervalId = setInterval(() => {
      setContentCheckAttempts(prev => prev + 1);
      
      if (checkContentReadiness()) {
        console.log('PDFPreview: All content is ready for preview');
        setIsContentReady(true);
        clearInterval(intervalId);
      } else if (contentCheckAttempts >= 30) { // 15 seconds timeout
        console.warn('PDFPreview: Content readiness check timed out');
        setIsContentReady(true); // Allow preview anyway
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [isOpen, contentCheckAttempts]);

  const handleDirectDownload = async () => {
    if (!isContentReady) {
      toast({
        title: "Content Not Ready",
        description: "Please wait for all content to load before downloading.",
        variant: "destructive",
      });
      return;
    }

    console.log('PDFPreview: Direct download initiated from preview container');
    setIsDownloading(true);
    
    try {
      // Get the actual preview container that's visible
      const previewContainer = document.getElementById('pdf-preview-container');
      if (!previewContainer) {
        throw new Error('Preview container not found');
      }

      console.log('PDFPreview: Found preview container, content length:', previewContainer.textContent?.length || 0);
      
      // Create a properly styled clone for PDF generation
      const containerClone = previewContainer.cloneNode(true) as HTMLElement;
      
      // Reset all transform and scaling styles that interfere with PDF generation
      containerClone.style.transform = 'none';
      containerClone.style.transformOrigin = 'initial';
      containerClone.style.scale = '1';
      containerClone.style.width = '794px'; // A4 width in pixels at 96 DPI
      containerClone.style.minHeight = 'auto';
      containerClone.style.maxWidth = 'none';
      containerClone.style.overflow = 'visible';
      containerClone.style.padding = '20px';
      containerClone.style.boxSizing = 'border-box';
      
      // Clean any problematic attributes for PDF generation
      const cleanHtmlForPdf = (element: HTMLElement): void => {
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
          
          // Remove any transform styles from child elements and ensure proper PDF rendering
          if (el instanceof HTMLElement) {
            el.style.transform = 'none';
            el.style.transformOrigin = 'initial';
            el.style.overflow = 'visible';
            
            // Fix chart container sizing for PDF
            if (el.classList.contains('recharts-wrapper') || el.classList.contains('radar-chart-container')) {
              el.style.width = '100%';
              el.style.height = '400px';
              el.style.maxWidth = '100%';
              el.style.overflow = 'visible';
            }
          }
        });
      };

      cleanHtmlForPdf(containerClone);
      
      // Add the clone to a temporary container off-screen for PDF generation
      const tempWrapper = document.createElement('div');
      tempWrapper.style.cssText = `
        position: fixed;
        top: -20000px;
        left: 0;
        width: 794px;
        background: white;
        z-index: -9999;
        visibility: hidden;
        overflow: visible;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #1f2937;
      `;
      
      tempWrapper.appendChild(containerClone);
      document.body.appendChild(tempWrapper);
      
      console.log('PDFPreview: Temporary container created with cloned content');

      // Give a moment for any final rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Enhanced html2pdf options specifically to fix clipping and multi-page issues
      const opt = {
        margin: [10, 10, 10, 10], // Small margins in mm
        filename: 'leadership-assessment-results.pdf',
        image: { 
          type: 'jpeg', 
          quality: 0.9
        },
        html2canvas: { 
          scale: 1, // Reduced scale to prevent oversizing
          useCORS: true,
          allowTaint: false,
          letterRendering: true,
          logging: false,
          width: 794, // A4 width in pixels
          height: null, // Let height be automatic for multi-page
          backgroundColor: '#ffffff',
          removeContainer: false,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false, // Disable to prevent chart rendering issues
          imageTimeout: 10000,
          onclone: (clonedDoc: Document) => {
            // Ensure all elements in the cloned document are properly sized
            const clonedElements = clonedDoc.querySelectorAll('*');
            clonedElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.transform = 'none';
                el.style.overflow = 'visible';
                
                // Fix chart containers specifically
                if (el.classList.contains('recharts-wrapper') || el.classList.contains('radar-chart-container')) {
                  el.style.width = '100%';
                  el.style.height = '400px';
                  el.style.maxWidth = '100%';
                }
              }
            });
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          hotfixes: ['px_scaling']
        },
        pagebreak: { 
          mode: ['avoid-all', 'css'],
          before: ['.page-break-before', '.ai-insights-section'],
          after: ['.page-break-after'],
          avoid: ['.page-break-avoid', '.radar-chart-container', '.insight-card']
        }
      };

      console.log('PDFPreview: Starting PDF generation with fixed scaling and multi-page support...');
      await html2pdf().set(opt).from(containerClone).save();
      
      // Clean up the temporary container
      document.body.removeChild(tempWrapper);
      
      toast({
        title: "Download Started",
        description: "Your complete multi-page PDF has been generated and downloaded successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error('PDFPreview: Error during direct download:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>PDF Preview - Leadership Assessment Results</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto border rounded-lg bg-gray-50 p-4 min-h-0">
          {!isContentReady && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-encourager mx-auto mb-4"></div>
                <p className="text-gray-600">Loading content for preview...</p>
                <p className="text-sm text-gray-500">Attempt {contentCheckAttempts}/30</p>
              </div>
            </div>
          )}
          
          <div 
            id="pdf-preview-container"
            className={`transition-opacity duration-300 ${isContentReady ? 'opacity-100' : 'opacity-30'}`}
            style={{
              transform: 'scale(0.75)',
              transformOrigin: 'top left',
              width: '133%',
              backgroundColor: 'white',
              minHeight: '297mm'
            }}
          >
            <PDFTemplate 
              categories={categories}
              demographics={demographics}
              assessmentId={assessmentId}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDirectDownload}
            disabled={!isContentReady || isDownloading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download Multi-Page PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
