
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import CoachingSupport from './dashboard/CoachingSupport';
import ResultsActions from './dashboard/ResultsActions';
import RecommendedSteps from './dashboard/RecommendedSteps';
import { calculateAverageGap } from '../utils/assessmentCalculations/averages';
import { useIsMobile } from '@/hooks/use-mobile';
import { Download, Mail, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { pdf } from '@react-pdf/renderer';
import ReactPDFDocument from './pdf/ReactPDFDocument';
import { captureRadarChartAsPNG } from '@/utils/chartCapture';
import SkillGapChart from './SkillGapChart';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { useAuth } from '@/contexts/AuthContext';

interface ResultsDashboardProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup?: () => void;
  assessmentId?: string;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  categories, 
  demographics, 
  onRestart, 
  onBack,
  onSignup,
  assessmentId
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Debug received categories with more detailed logging
  useEffect(() => {
    console.log("ResultsDashboard - Received categories count:", categories?.length || 0);
    console.log("ResultsDashboard - Received assessmentId:", assessmentId);
    
    // Check actual rating data
    let totalRatingsFound = 0;
    let totalSkillsWithRatings = 0;
    
    categories.forEach(category => {
      if (!category || !category.skills) return;
      
      category.skills.forEach(skill => {
        if (!skill || !skill.ratings) return;
        
        if (typeof skill.ratings.current === 'number') totalRatingsFound++;
        if (typeof skill.ratings.desired === 'number') totalRatingsFound++;
        
        if (typeof skill.ratings.current === 'number' || typeof skill.ratings.desired === 'number') {
          totalSkillsWithRatings++;
        }
      });
    });
    
    console.log(`ResultsDashboard - Found ${totalRatingsFound} total rating values across ${totalSkillsWithRatings} skills`);
  }, [categories, assessmentId]);
  
  // Calculate metrics with extra error handling
  let averageGap = 0;
  
  try {
    // Ensure we have valid categories before calculations
    if (categories && categories.length > 0 && 
        categories.some(cat => cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number'
        ))) {
      
      console.log("ResultsDashboard - Calculating metrics with valid data");
      averageGap = calculateAverageGap(categories);
      
      console.log("ResultsDashboard - Metrics calculated:", {
        averageGap
      });
    } else {
      console.log("ResultsDashboard - Skipped metrics calculation due to invalid data");
    }
  } catch (error) {
    console.error("ResultsDashboard - Error calculating metrics:", error);
  }

  // PDF generation state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Calculate average gap for insights hook
  const averageGapForInsights = categories.length > 0 ? calculateAverageGap(categories) : 0;
  
  // Use the insights hook to get insights for PDF
  const { insights, isLoading: insightsLoading, error: insightsError } = useOpenAIInsights({
    categories,
    demographics,
    averageGap: averageGapForInsights,
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

  // PDF download handler
  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
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
    
    let chartImageDataUrl: string | null = null;
    
    try {
      // Capture the radar chart
      try {
        chartImageDataUrl = await captureRadarChartAsPNG();
      } catch (chartError) {
        console.error('Chart capture failed:', chartError);
      }
      
      // Generate PDF document
      const pdfDoc = (
        <ReactPDFDocument
          categories={categories}
          demographics={demographics}
          insights={insights || ''}
          chartImageDataUrl={chartImageDataUrl || undefined}
        />
      );
      
      // Generate PDF blob
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }
      
      // Create and trigger download
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
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed", 
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setIsExportingPDF(false);
    }
  };



  // Mobile-specific results view
  if (isMobile) {
    return (
      <>
        {/* Hidden/offscreen radar chart for PDF export */}
        {isExportingPDF && (
          <div 
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              top: 0, 
              width: 540,
              height: 440,
              zIndex: -1
            }}
          >
            <SkillGapChart categories={categories} isPDF={true} />
          </div>
        )}
        <div className="fade-in space-y-6">
          <Card>
          <CardHeader className="flex flex-col items-center text-center space-y-4">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
                alt="Leader Leap Assessment Logo" 
                className="h-20 w-auto" 
              />
            </div>
            <div className="w-full">
              <CardTitle className="text-2xl text-center w-full">Your Leader Leap Assessment Results</CardTitle>
              <CardDescription className="text-center mt-2 w-full">
                Review your leadership competency gaps and development opportunities
              </CardDescription>
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
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF Report
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
  }

  // Desktop view (unchanged)
  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader className={`flex ${isMobile ? 'flex-col items-start gap-4' : 'flex-row items-center justify-between'}`}>
          <div className={`${isMobile ? 'w-full' : 'flex-1 pr-4'}`}>
            <CardTitle className="text-2xl text-left">Your Leader Leap Assessment Results</CardTitle>
            <CardDescription className="text-left mt-2">
              Review your leadership competency gaps and development opportunities
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Leader Leap Assessment Logo" 
              className={`w-auto ${isMobile ? 'h-16' : 'h-28'}`}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6" id="results-content">
          {/* Detailed Analysis - Competency visualization and insights */}
          <div data-section="detailed-analysis">
            <DetailedAnalysis 
              categories={categories}
              demographics={demographics}
              averageGap={averageGap}
              assessmentId={assessmentId}
            />
          </div>
          
          {/* Recommended Next Steps */}
          <div data-section="recommended-steps">
            <RecommendedSteps />
          </div>
          
          {/* Coaching Support and Sign Up side by side */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`} data-section="coaching-support">
              <CoachingSupport />
            </div>
            <div className="col-span-1">
              {!onSignup ? (
                <div className="bg-white p-3 h-full border border-slate-200 rounded-lg shadow-sm flex flex-col justify-center items-center">
                  <img 
                    src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png" 
                    alt="Coach Portrait" 
                    className="rounded-lg w-full h-auto object-cover" 
                  />
                </div>
              ) : (
                <div className="bg-white p-4 h-full border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
                  <p className="text-slate-700 mb-6">
                    <strong>Want to save your results, download as PDF, and access them later?</strong><br />
                    Create an account to unlock all features of the Leader Leap Assessment Tool.
                  </p>
                  <button 
                    className="bg-encourager hover:bg-encourager-light text-white px-4 py-2 rounded-md transition-colors w-full mt-auto"
                    onClick={onSignup}
                  >
                    Create a free Account
                  </button>
                </div>
              )}
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
  );
};

export default ResultsDashboard;
