
import React, { useState } from 'react';
import { ArrowLeft, Download, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import PDFPreviewDialog from '../pdf/PDFPreviewDialog';

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
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  
  // Calculate average gap for insights hook
  const averageGap = categories.length > 0 ? calculateAverageGap(categories) : 0;
  
  // Use the insights hook to check if insights are ready - CRITICAL: Pass assessmentId for consistency
  const { insights, isLoading: insightsLoading, error: insightsError } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
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
      'Encourager GPT is analyzing',
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
  
  // Show preview dialog instead of direct export
  const handleShowPreview = () => {
    console.log('ResultsActions: PDF preview button clicked');
    console.log('ResultsActions: categories received:', categories?.length || 0);
    console.log('ResultsActions: demographics received:', demographics ? Object.keys(demographics) : 'none');
    console.log('ResultsActions: assessmentId for consistent insights:', assessmentId);
    
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
    
    console.log('ResultsActions: Data validation and insights check passed, showing preview...');
    setShowPreview(true);
  };

  // Actual PDF export function that gets called from the preview dialog
  const handleConfirmExport = () => {
    console.log('ResultsActions: Confirmed export from preview, calling exportToPDF with assessmentId...');
    
    try {
      // CRITICAL: Pass assessmentId to ensure PDF uses the same stored insights
      exportToPDF(categories, demographics, insights, assessmentId, 'leadership-assessment-results.pdf');
      
      // For guest users, suggest signup after successful export
      if (!user && onSignup) {
        setTimeout(() => {
          toast({
            title: "Save Your Results",
            description: "Sign up to save your results permanently in your account.",
          });
        }, 2000);
      }
    } catch (error) {
      console.error('ResultsActions: Error calling exportToPDF:', error);
      toast({
        title: "Error exporting PDF",
        description: "There was an issue creating your PDF. Please try again.",
        variant: "destructive",
      });
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

  // Determine if PDF export should be disabled
  const isPDFExportDisabled = !hasValidAssessmentData() || !areInsightsReadyForExport();
  
  // Generate appropriate button text and tooltip
  const getPDFButtonText = () => {
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
    if (!hasValidAssessmentData()) {
      return 'Complete the assessment first';
    }
    if (insightsLoading) {
      return 'AI insights are being generated. Please wait...';
    }
    if (!areInsightsReadyForExport()) {
      return 'Waiting for AI insights to complete';
    }
    return 'Preview and export your complete assessment results including AI insights';
  };
  
  return (
    <>
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="encourager" 
                  className="flex items-center gap-2"
                  onClick={handleShowPreview}
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

      <PDFPreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirmExport={handleConfirmExport}
        categories={categories}
        demographics={demographics}
        assessmentId={assessmentId}
      />
    </>
  );
};

export default ResultsActions;
