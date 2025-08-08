
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessmentData } from '../hooks/useAssessmentData';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../contexts/AuthContext';
import { usePreviousResults } from '../hooks/usePreviousResults';
import { useResultsManagement } from '../hooks/useResultsManagement';
import { InsightsProvider } from '../hooks/InsightsProvider';
import { Category, Demographics } from '../utils/assessmentTypes';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import ProfileSummary from './dashboard/ProfileSummary';
import KeyInsights from './dashboard/KeyInsights';
import RecommendedSteps from './dashboard/RecommendedSteps';
import StrengthsBasedApproach from './dashboard/StrengthsBasedApproach';
import CoachingSupport from './dashboard/CoachingSupport';
import SkillGapChart from './SkillGapChart';
import ResultsActions from './dashboard/ResultsActions';
import MobileResultsView from './dashboard/MobileResultsView';
import SEO from '../components/SEO';
import { logger } from '../utils/logger';

interface ResultsDashboardProps {
  categories?: Category[];
  demographics?: Demographics;
  assessmentId?: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  categories: propCategories = [],
  demographics: propDemographics = {},
  assessmentId: propAssessmentId
}) => {
  const { assessmentId: urlAssessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Use the assessmentId from props or URL params
  const finalAssessmentId = propAssessmentId || urlAssessmentId;
  
  // Navigation functions for mobile view
  const handleBack = () => {
    if (finalAssessmentId) {
      navigate('/profile');
    } else {
      navigate('/assessment');
    }
  };
  
  const handleRestart = () => {
    // Use the proper fresh assessment logic instead of direct navigation
    // This will clear localStorage and start a fresh assessment
    localStorage.removeItem('assessmentData');
    navigate('/assessment?new=true');
  };
  
  const handleSignup = () => {
    // This will be handled by the ResultsActions component
  };
  
  // Mock functions for usePreviousResults since we don't need them in this context
  const mockSetCategories = () => {};
  const mockSetDemographics = () => {};
  const mockSetCurrentStep = () => {};
  
  const { loadingPreviousResults, handleLoadPreviousResults } = usePreviousResults(
    mockSetCategories,
    mockSetDemographics,
    mockSetCurrentStep
  );
  
  // Use the data passed from parent component
  const categories = propCategories || [];
  const demographics = propDemographics || {};
  const isAssessmentDataValid = categories.length > 0;
  const dataLoading = false;
  const dataError = null;

  const resultsManagement = useResultsManagement({
    categories: categories || [],
    demographics: demographics || {}
  });

  // Memoize the data to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories || [], [categories]);
  const memoizedDemographics = useMemo(() => demographics || {}, [demographics]);
  const memoizedAverageGap = useMemo(() => {
    if (!memoizedCategories || memoizedCategories.length === 0) return 0;
    // Calculate average gap from categories
    const totalGap = memoizedCategories.reduce((sum, category) => {
      if (category.skills) {
        const categoryGap = category.skills.reduce((skillSum, skill) => {
          if (skill.ratings && skill.ratings.current && skill.ratings.desired) {
            return skillSum + (skill.ratings.desired - skill.ratings.current);
          }
          return skillSum;
        }, 0);
        return sum + categoryGap;
      }
      return sum;
    }, 0);
    return totalGap / memoizedCategories.length;
  }, [memoizedCategories]);

  // Debug logging
  logger.debug('Results page - Debug info', {
    hasCategories: !!categories && categories.length > 0,
    hasAssessmentId: !!finalAssessmentId,
    isUser: !!user,
    loadingPreviousResults
  });

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Results</h2>
          <p className="text-gray-600">
            {typeof dataError === 'string' ? dataError : 'An error occurred while loading results.'}
          </p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Assessment Data</h2>
          <p className="text-gray-600">No assessment data found for this ID.</p>
        </div>
      </div>
    );
  }

  // Mobile-specific results view
  if (isMobile) {
    return (
      <InsightsProvider
        categories={memoizedCategories}
        demographics={memoizedDemographics}
        averageGap={memoizedAverageGap}
        assessmentId={finalAssessmentId!}
      >
        <MobileResultsView
          categories={memoizedCategories}
          demographics={memoizedDemographics}
          assessmentId={finalAssessmentId}
          onBack={handleBack}
          onRestart={handleRestart}
          onSignup={handleSignup}
        />
      </InsightsProvider>
    );
  }

  // Desktop view
  return (
    <InsightsProvider
      categories={memoizedCategories}
      demographics={memoizedDemographics}
      averageGap={memoizedAverageGap}
      assessmentId={finalAssessmentId!}
    >
      <div className="min-h-screen bg-white">
        <SEO 
          title="Leadership Assessment Results" 
          description="Your personalised leadership assessment results and insights"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            {/* Header Section */}
            <div className="p-6 pt-10 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Your Leader Leap Assessment Results</h1>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-nowrap">Review your leadership competency gaps and development opportunities</p>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src="/encouragercoachinglogo.png" 
                    alt="Encourager Coaching" 
                    className="h-24 w-auto"
                  />
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6">
              <DetailedAnalysis 
                categories={memoizedCategories}
                demographics={memoizedDemographics}
                averageGap={memoizedAverageGap}
                assessmentId={finalAssessmentId!}
              />
            </div>
          </div>
          
          {/* Recommended Steps */}
          <div className="mt-8">
            <RecommendedSteps 
              categories={memoizedCategories}
              demographics={memoizedDemographics}
              averageGap={memoizedAverageGap}
            />
          </div>
          
          {/* Coaching Support */}
          <div className="mt-8">
            <CoachingSupport 
              categories={memoizedCategories}
              demographics={memoizedDemographics}
              averageGap={memoizedAverageGap}
            />
          </div>
          
          {/* Results Actions */}
          <div className="mt-8">
            <ResultsActions 
              categories={memoizedCategories}
              demographics={memoizedDemographics}
              assessmentId={finalAssessmentId!}
              onRestart={handleRestart}
              onBack={handleBack}
              onSignup={handleSignup}
            />
          </div>
        </div>
      </div>
    </InsightsProvider>
  );
};
