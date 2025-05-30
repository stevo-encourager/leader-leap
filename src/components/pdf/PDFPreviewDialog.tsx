import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import PDFTemplate from './PDFTemplate';
import { toast } from '@/hooks/use-toast';
import { generatePDFWithJsPDF } from '@/utils/jsPDFGenerator';

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
      const hasHeader = textContent.includes('Leader Leap Assessment Results');
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

    console.log('PDFPreview: Direct download initiated using jsPDF');
    setIsDownloading(true);
    
    try {
      // Get insights from the preview container
      const previewContainer = document.getElementById('pdf-preview-container');
      let insights = '';
      
      if (previewContainer) {
        // Try to extract insights from the rendered content
        const insightsSection = previewContainer.querySelector('[data-insights]');
        if (insightsSection) {
          insights = insightsSection.getAttribute('data-insights') || '';
        }
      }

      console.log('PDFPreview: Generating PDF with jsPDF...');
      
      await generatePDFWithJsPDF(
        categories,
        demographics,
        insights,
        'leader-leap-assessment-results.pdf'
      );
      
      toast({
        title: "Download Successful",
        description: "Your Leader Leap assessment results have been downloaded as a PDF with proper page breaks.",
      });
      
      onClose();
    } catch (error) {
      console.error('PDFPreview: Error during jsPDF download:', error);
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
            <span>PDF Preview - Leader Leap Assessment Results</span>
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
            {isDownloading ? 'Generating PDF...' : 'Download PDF (jsPDF)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewDialog;
