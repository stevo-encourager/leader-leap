import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor } from 'lucide-react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useInsights } from '@/hooks/InsightsProvider';
import { pdf } from '@react-pdf/renderer';
import ReactPDFDocument from '../pdf/ReactPDFDocument';
import { captureRadarChartAsPNG } from '@/utils/chartCapture';
import SkillGapChart from '../SkillGapChart';
import ResultsActions from './ResultsActions';
import { logger } from '@/utils/productionLogger';

interface MobileResultsViewProps {
  categories: Category[];
  demographics: Demographics;
  assessmentId?: string;
  onBack: () => void;
  onRestart: () => void;
  onSignup?: () => void;
}

const MobileResultsView: React.FC<MobileResultsViewProps> = ({
  categories,
  demographics,
  assessmentId,
  onBack,
  onRestart,
  onSignup
}) => {
  const { user, userProfile } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Use the insights hook to get insights data (same as desktop version)
  const { insights, isLoading: insightsLoading, error: insightsError } = useInsights();

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

  // Check if AI insights are ready for PDF export (same as desktop version)
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

  // Enhanced PDF download with better error handling
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
        logger.error('📱 MobilePDF: Chart capture error:', chartError);
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
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const ukDateString = `${day}-${month}-${year}`;
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leader-leap-assessment-results - ${ukDateString}.pdf`;
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

  return (
    <>
      {/* Hidden/offscreen radar chart for PDF export - Match SkillGapChart expectations */}
      {isExportingPDF && (
        <div 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: 0, 
            width: 600,
            height: 500,
            zIndex: -1
          }}
        >
          <SkillGapChart categories={categories} isPDF={true} />
        </div>
      )}
      
      <div className="fade-in space-y-6">
        <Card>
          <CardHeader className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-encourager/10 p-3 rounded-full">
                <Monitor className="text-encourager" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Your Leader Leap Assessment Results
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Review your leadership competency gaps and development opportunities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" id="results-content">
            {/* Mobile-specific content */}
            <div className="text-center py-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  📱 Mobile View Notice
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  For the best experience viewing your detailed results, we recommend using a desktop computer.
                  Your full assessment report is available for download below.
                </p>
              </div>
              
              <div className="space-y-4">
                {!areInsightsReadyForExport() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm text-center">
                      🤖 Hold tight, your report will be ready soon. We're just generating AI insights.
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || !hasValidAssessmentData()}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF Report'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-6 mt-4 border-t">
            <div className="w-full">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full">
                <ResultsActions 
                  onBack={onBack} 
                  onRestart={onRestart} 
                  onSignup={onSignup}
                  categories={categories}
                  demographics={demographics}
                  assessmentId={assessmentId}
                />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default MobileResultsView; 