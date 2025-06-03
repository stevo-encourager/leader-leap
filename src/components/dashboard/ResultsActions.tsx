
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
  // CRITICAL DEBUG: Log all component render state at the very top
  console.log('🔍 🚨 RESULTS ACTIONS COMPONENT RENDER - TOP OF FUNCTION:', {
    assessmentId,
    assessmentIdType: typeof assessmentId,
    assessmentIdLength: assessmentId?.length || 0,
    categories: categories?.length || 0,
    demographics: Object.keys(demographics || {}),
    propsReceived: { onBack: !!onBack, onRestart: !!onRestart, onSignup: !!onSignup }
  });

  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  // CRITICAL DEBUG: Log the comparison logic immediately after definition
  console.log('🔍 🚨 TEST ASSESSMENT CHECK:', {
    assessmentId,
    TEST_ASSESSMENT_ID,
    isTestAssessment,
    exactMatch: assessmentId === TEST_ASSESSMENT_ID,
    stringComparison: String(assessmentId) === String(TEST_ASSESSMENT_ID)
  });

  // Calculate average gap for insights hook
  const averageGap = categories.length > 0 ? calculateAverageGap(categories) : 0;
  
  // Use the insights hook DIRECTLY to get regenerateInsights function
  const { insights, isLoading: insightsLoading, error: insightsError, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  // CRITICAL DEBUG: Log insights hook state
  console.log('🔍 🚨 INSIGHTS HOOK STATE:', {
    hasInsights: !!insights,
    insightsLoading,
    hasRegenerateFunction: !!regenerateInsights,
    regenerateFunctionType: typeof regenerateInsights
  });

  // Enhanced validation to check if we actually have assessment data
  const hasValidAssessmentData = () => {
    console.log('ResultsActions: Checking for valid assessment data...');
    console.log('ResultsActions: categories length:', categories?.length || 0);
    console.log('ResultsActions: assessmentId:', assessmentId);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log('ResultsActions: No categories or empty array');
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
    
    console.log('ResultsActions: Validation results:', {
      skillsWithRatings,
      totalRatingValues,
      isValid: skillsWithRatings > 0 && totalRatingValues > 0
    });
    
    return skillsWithRatings > 0 && totalRatingValues > 0;
  };
  
  // Check if AI insights are ready for PDF export
  const areInsightsReadyForExport = () => {
    if (insightsLoading) {
      console.log('ResultsActions: Insights are still loading');
      return false;
    }
    
    if (insightsError) {
      console.log('ResultsActions: Insights failed to load, but allowing export');
      return true; // Allow export even if insights failed
    }
    
    if (!insights || insights.trim().length === 0) {
      console.log('ResultsActions: No insights available yet');
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
      console.log('ResultsActions: Insights contain placeholder text');
      return false;
    }
    
    console.log('ResultsActions: Insights are ready for export with consistent data');
    return true;
  };
  
  // Enhanced PDF download with better error handling and debugging
  const handleDownloadPDF = async () => {
    console.log('=== PDF DOWNLOAD DEBUG START ===');
    console.log('ResultsActions: PDF download button clicked');
    console.log('ResultsActions: categories received:', categories?.length || 0);
    console.log('ResultsActions: demographics received:', demographics ? Object.keys(demographics) : 'none');
    console.log('ResultsActions: assessmentId for consistent insights:', assessmentId);
    console.log('ResultsActions: insights ready:', areInsightsReadyForExport());
    console.log('ResultsActions: insights length:', insights?.length || 0);
    
    if (!hasValidAssessmentData()) {
      console.error('ResultsActions: PDF generation failed - no valid assessment data');
      toast({
        title: "Cannot Export PDF",
        description: "No completed assessment data available. Please complete the assessment with actual ratings first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!areInsightsReadyForExport()) {
      console.error('ResultsActions: PDF generation failed - insights not ready');
      toast({
        title: "Please Wait",
        description: "AI insights are still being generated. Please wait a moment and try again.",
        variant: "default",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      console.log('ResultsActions: Starting PDF generation with React PDF');
      
      // Step 1: Capture the radar chart with enhanced error handling
      console.log('ResultsActions: Step 1 - Attempting to capture radar chart...');
      let chartImageDataUrl: string | null = null;
      
      try {
        chartImageDataUrl = await captureRadarChartAsPNG();
        if (chartImageDataUrl) {
          console.log('ResultsActions: Chart capture successful, data length:', chartImageDataUrl.length);
        } else {
          console.warn('ResultsActions: Chart capture returned null');
        }
      } catch (chartError) {
        console.error('ResultsActions: Chart capture failed with error:', chartError);
        // Continue without chart - don't fail the entire PDF generation
      }
      
      // Step 2: Generate PDF document
      console.log('ResultsActions: Step 2 - Creating PDF document...');
      const pdfDoc = (
        <ReactPDFDocument
          categories={categories}
          demographics={demographics}
          insights={insights || ''}
          chartImageDataUrl={chartImageDataUrl || undefined}
        />
      );
      
      // Step 3: Generate PDF blob
      console.log('ResultsActions: Step 3 - Generating PDF blob...');
      const pdfBlob = await pdf(pdfDoc).toBlob();
      console.log('ResultsActions: PDF blob generated successfully, size:', pdfBlob.size);
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }
      
      // Step 4: Create and trigger download
      console.log('ResultsActions: Step 4 - Creating download link...');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leader-leap-assessment-results.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('ResultsActions: PDF download successful');
      toast({
        title: "Download Successful",
        description: "Your Leader Leap assessment results have been downloaded as a PDF.",
      });
      
    } catch (error) {
      console.error('=== PDF GENERATION ERROR ===');
      console.error('ResultsActions: Error during PDF generation:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
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
      console.log('=== PDF DOWNLOAD DEBUG END ===');
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
    console.log('🔍 🚨 HANDLE REGENERATE INSIGHTS CALLED - BUTTON CLICK HANDLER!');
    console.log('🔍 ResultsActions: Direct button click with:', {
      isTestAssessment,
      assessmentId,
      hasRegenerateFunction: !!regenerateInsights,
      regenerateInsights: typeof regenerateInsights
    });
    
    if (isTestAssessment) {
      console.log('🔍 ResultsActions: Regenerating insights for test assessment');
      toast({
        title: "Regenerating Insights",
        description: "Generating new AI insights for test assessment...",
      });
      
      if (regenerateInsights) {
        console.log('🔍 ResultsActions: About to call regenerateInsights() DIRECTLY');
        try {
          await regenerateInsights();
          console.log('🔍 ResultsActions: Direct regenerateInsights() completed successfully');
        } catch (error) {
          console.error('🔍 ResultsActions: Direct regenerateInsights() failed:', error);
          toast({
            title: "Regeneration Failed",
            description: "Failed to regenerate insights. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.error('🔍 ResultsActions: regenerateInsights function not available');
        toast({
          title: "Cannot Regenerate",
          description: "Regeneration function not available. Please refresh the page.",
          variant: "destructive",
        });
      }
    } else {
      console.log('🔍 ResultsActions: Regeneration requested for non-test assessment - not allowed');
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

  // CRITICAL DEBUG: Log right before rendering to confirm button should be visible
  console.log('🔍 🚨 ABOUT TO RENDER BUTTONS - FINAL CHECK:', {
    isTestAssessment,
    assessmentId,
    TEST_ASSESSMENT_ID,
    willRenderRegenerateButton: isTestAssessment
  });

  return (
    <div className="flex justify-between w-full">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessment
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
            {/* CRITICAL DEBUG: Log inside the conditional that renders the button */}
            {console.log('🔍 🚨 RENDERING REGENERATE BUTTON - INSIDE CONDITIONAL!')}
            {console.log('🔍 🚨 BUTTON RENDER STATE:', { isTestAssessment, insightsLoading })}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log('🔍 🚨 BUTTON ONCLICK FIRED - VERY FIRST LINE!');
                      console.log('🔍 Button onClick called, isTestAssessment:', isTestAssessment);
                      console.log('🔍 About to call handleRegenerateInsights DIRECTLY');
                      handleRegenerateInsights();
                    }}
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
        <Button onClick={handleNewAssessment}>
          <Plus className="mr-2 h-4 w-4" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

export default ResultsActions;
