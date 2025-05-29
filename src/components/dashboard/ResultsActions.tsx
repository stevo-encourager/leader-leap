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
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Calculate average gap for insights hook
  const averageGap = categories.length > 0 ? calculateAverageGap(categories) : 0;
  
  // Use the insights hook to check if insights are ready
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
  
  // Enhanced PDF download with comprehensive debugging
  const handleDownloadPDF = async () => {
    console.log('ResultsActions: Starting PDF download with comprehensive debugging...');
    
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
    
    try {
      console.log('ResultsActions: Starting enhanced chart capture process...');
      
      // Show user that we're capturing the chart
      toast({
        title: "Preparing PDF",
        description: "Capturing radar chart visualization...",
        variant: "default",
      });
      
      // Wait a bit to ensure chart is fully rendered before capture
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced chart capture with multiple attempts and detailed logging
      let chartImageDataUrl: string | null = null;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`ResultsActions: Chart capture attempt ${attempt}/${maxAttempts}`);
        
        // Check if chart elements are present before attempting capture
        const radarContainers = document.querySelectorAll('[data-testid="radar-chart-container"], .radar-chart-container');
        const svgElements = document.querySelectorAll('svg');
        console.log(`ResultsActions: Pre-capture check - radar containers: ${radarContainers.length}, SVGs: ${svgElements.length}`);
        
        chartImageDataUrl = await captureRadarChartAsPNG();
        
        console.log(`ResultsActions: Attempt ${attempt} result:`, {
          success: !!chartImageDataUrl,
          dataLength: chartImageDataUrl?.length || 0,
          startsWithPNG: chartImageDataUrl?.startsWith('data:image/png') || false
        });
        
        if (chartImageDataUrl && chartImageDataUrl.startsWith('data:image/png') && chartImageDataUrl.length > 1000) {
          console.log(`ResultsActions: Chart captured successfully on attempt ${attempt}`);
          break;
        }
        
        if (attempt < maxAttempts) {
          console.log(`ResultsActions: Attempt ${attempt} failed, waiting before retry...`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!chartImageDataUrl || !chartImageDataUrl.startsWith('data:image/png') || chartImageDataUrl.length < 1000) {
        console.warn('ResultsActions: All chart capture attempts failed or produced invalid data');
        console.log('ResultsActions: Chart capture final result:', {
          hasData: !!chartImageDataUrl,
          dataLength: chartImageDataUrl?.length || 0,
          startsWithPNG: chartImageDataUrl?.startsWith('data:image/png') || false,
          preview: chartImageDataUrl?.substring(0, 50) || 'null'
        });
        
        toast({
          title: "Chart Capture Warning",
          description: "Unable to capture the radar chart. PDF will be generated with a placeholder.",
          variant: "default",
        });
        
        // Set to undefined to trigger placeholder in PDF
        chartImageDataUrl = undefined;
      } else {
        console.log('ResultsActions: Chart successfully captured for PDF inclusion');
        toast({
          title: "Chart Captured",
          description: "Radar chart captured successfully. Generating PDF...",
          variant: "default",
        });
      }
      
      // Generate PDF with enhanced error handling
      console.log('ResultsActions: Generating PDF document...');
      
      const pdfDoc = (
        <ReactPDFDocument
          categories={categories}
          demographics={demographics}
          insights={insights || ''}
          chartImageDataUrl={chartImageDataUrl || undefined}
        />
      );
      
      console.log('ResultsActions: Creating PDF blob...');
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      console.log('ResultsActions: PDF blob created:', {
        size: pdfBlob.size,
        type: pdfBlob.type
      });
      
      // Create and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leadership-assessment-results.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('ResultsActions: PDF download completed successfully');
      
      toast({
        title: "Download Successful",
        description: chartImageDataUrl 
          ? "Your leadership assessment results have been downloaded with the radar chart included."
          : "Your leadership assessment results have been downloaded (chart placeholder included due to capture issues).",
      });
      
    } catch (error) {
      console.error('ResultsActions: Error during enhanced PDF download:', error);
      console.error('ResultsActions: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Download Failed", 
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
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
