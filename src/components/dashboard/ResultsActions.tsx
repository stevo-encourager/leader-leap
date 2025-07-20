import React, { useState } from 'react';
import { ArrowLeft, Download, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import { pdf } from '@react-pdf/renderer';
import ReactPDFDocument from '../pdf/ReactPDFDocument';
import { captureRadarChartAsPNG } from '@/utils/chartCapture';
import SkillGapChart from '../SkillGapChart';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResultsActionsProps {
  onBack: () => void;
  onRestart: () => void;
  onSignup?: () => void;
  categories?: Category[];
  demographics?: Demographics;
  assessmentId?: string;
}

const ResultsActions: React.FC<ResultsActionsProps> = ({ 
  onBack, 
  onRestart, 
  onSignup,
  categories = [],
  demographics = {},
  assessmentId
}) => {


  const { user, userProfile } = useAuth();
  const isMobile = useIsMobile();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // UPDATED: Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  


  // Calculate average gap for insights hook
  const averageGap = categories.length > 0 ? calculateAverageGap(categories) : 0;
  
  // Use the insights hook DIRECTLY to get regenerateInsights function
  const { insights, isLoading: insightsLoading, error: insightsError, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });



  // Enhanced validation to check if we actually have assessment data
  const hasValidAssessmentData = () => {
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return false;
    }
    
    let skillsWithRatings = 0;
    let totalRatingValues = 0;
    
    categories.forEach(category => {
      if (category && category.skills && Array.isArray(category.skills)) {
        category.skills.forEach(skill => {
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
    
    return skillsWithRatings > 0 && totalRatingValues > 0;
  };
  
  // Check if AI insights are ready for PDF export
  const areInsightsReadyForExport = () => {
    if (insightsLoading) {
      return false;
    }
    
    if (insightsError) {
      return true; // Allow export even if insights failed
    }
    
    if (!insights || insights.trim().length === 0) {
      return false;
    }
    
    // Check if insights contain placeholder text
    const placeholderTexts = [
      'analysing your assessment results',
      'analyzing your assessment results',
      'EncouragerGPT is analyzing',
      'generating insights',
      'please wait'
    ];
    
    const hasPlaceholder = placeholderTexts.some(placeholder => 
      insights.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    if (hasPlaceholder) {
      return false;
    }
    
    return true;
  };
  
  // Enhanced PDF download with better error handling and debugging
  const handleDownloadPDF = async () => {
    setIsExportingPDF(true); // Show hidden chart
    // Wait for chart to render in DOM
    await new Promise(res => setTimeout(res, 1200));
    
    if (!hasValidAssessmentData()) {
      toast({
        title: "Cannot Export PDF",
        description: "No completed assessment data available. Please complete the assessment with actual ratings first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!areInsightsReadyForExport()) {
      toast({
        title: "Please Wait",
        description: "AI insights are still being generated. Please wait a moment and try again.",
        variant: "default",
      });
      return;
    }
    
    setIsDownloading(true);
    
    // Declare variables outside try block for cleanup in finally
    let chartImageDataUrl: string | null = null;
    
    try {
      // Step 1: Capture the radar chart with enhanced error handling
      try {
        chartImageDataUrl = await captureRadarChartAsPNG();
      } catch (chartError) {
        // Continue without chart - don't fail the entire PDF generation
      }
      
      // Step 2: Generate PDF document
      const pdfDoc = (
        <ReactPDFDocument
          categories={categories}
          demographics={demographics}
          insights={insights || ''}
          chartImageDataUrl={chartImageDataUrl || undefined}
          userName={userProfile?.full_name}
        />
      );
      
      // Step 3: Generate PDF blob
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }
      
      // Step 4: Create and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leader-leap-assessment-results.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Download Successful",
        description: "Your Leader Leap assessment results have been downloaded as a PDF.",
      });
      
    } catch (error) {
      
      // More specific error messages based on error type
      let errorMessage = "There was an error generating your PDF. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('canvas')) {
          errorMessage = "Chart rendering failed. Please ensure the assessment results are fully loaded and try again.";
        } else if (error.message.includes('blob') || error.message.includes('empty')) {
          errorMessage = "PDF generation failed - document was empty. Please refresh the page and try again.";
        } else if (error.message.includes('memory') || error.message.includes('size')) {
          errorMessage = "PDF generation failed due to memory constraints. Please try again or contact support.";
        }
      }
      
      toast({
        title: "Download Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setIsExportingPDF(false); // Clean up hidden chart
      
      // Clean up blob URL if it was created
      if (chartImageDataUrl) {
        URL.revokeObjectURL(chartImageDataUrl);
      }
      
  
    }
  };

  const handleNewAssessment = () => {
    // Notify user that a new assessment is starting
    toast({
      title: "Starting new assessment",
      description: "All previous ratings have been reset to default values.",
    });
    
    // Call the provided restart function
    onRestart();
  };

  // FIXED: Direct regeneration handler - no callback chain needed
  const handleRegenerateInsights = async () => {
    if (isTestAssessment) {
      toast({
        title: "Regenerating Insights",
        description: "Generating new AI insights for test assessment...",
      });
      
      if (regenerateInsights) {
        try {
          await regenerateInsights();
        } catch (error) {
          toast({
            title: "Regeneration Failed",
            description: "Failed to regenerate insights. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Cannot Regenerate",
          description: "Regeneration function not available. Please refresh the page.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot Regenerate",
        description: "Insights can only be regenerated for test assessments.",
        variant: "destructive",
      });
    }
  };

  // Determine if PDF export should be disabled
  const isPDFExportDisabled = !hasValidAssessmentData() || !areInsightsReadyForExport() || isDownloading;
  
  // Generate appropriate button text and tooltip
  const getPDFButtonText = () => {
    if (isDownloading) {
      return 'Generating PDF...';
    }
    if (!hasValidAssessmentData()) {
      return user ? 'Download PDF' : 'Save as PDF';
    }
    if (insightsLoading) {
      return 'Generating Insights...';
    }
    if (!areInsightsReadyForExport()) {
      return 'Waiting for Insights...';
    }
    return user ? 'Download PDF' : 'Save as PDF';
  };

  const getPDFTooltipText = () => {
    if (isDownloading) {
      return 'Generating your PDF document...';
    }
    if (!hasValidAssessmentData()) {
      return 'Complete the assessment first';
    }
    if (insightsLoading) {
      return 'AI insights are being generated. Please wait...';
    }
    if (!areInsightsReadyForExport()) {
      return 'Waiting for AI insights to complete';
    }
    return 'Download your complete assessment results as a professionally formatted PDF';
  };



  return (
    <>
      {/* Hidden/offscreen radar chart for PDF export */}
      {isExportingPDF && (
        // IMPORTANT: These dimensions must match PDF_CONTAINER_WIDTH and PDF_CONTAINER_HEIGHT in SkillGapChart.tsx
        <div 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: 0, 
            width: 540, // Must match PDF_CONTAINER_WIDTH
            height: 440, // Must match PDF_CONTAINER_HEIGHT
            zIndex: -1
          }}
        >
          <SkillGapChart categories={categories} isPDF={true} />
        </div>
      )}
      <div className={`${isMobile ? 'flex flex-col gap-4' : 'flex justify-between'} w-full`}>
        {isMobile ? (
          <>
            <Button onClick={handleNewAssessment}>
              <Plus className="mr-2 h-4 w-4" />
              Start New Assessment
            </Button>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Your Profile Page
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Your Profile Page
            </Button>
            <div className="flex gap-2">
              {!user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={onSignup}
                        className="flex items-center gap-2"
                      >
                        Sign Up
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-sm">Create an account to save your results and access them anytime</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isTestAssessment && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={handleRegenerateInsights}
                          disabled={insightsLoading}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          {insightsLoading ? 'Regenerating...' : 'Regenerate Insights'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-sm">Regenerate AI insights for this test assessment</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              {!isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="encourager" 
                        className="flex items-center gap-2"
                        onClick={handleDownloadPDF}
                        disabled={isPDFExportDisabled}
                      >
                        <Download className="h-4 w-4" />
                        {getPDFButtonText()}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-sm">{getPDFTooltipText()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button onClick={handleNewAssessment}>
                <Plus className="mr-2 h-4 w-4" />
                Start New Assessment
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ResultsActions;
