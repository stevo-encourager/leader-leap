
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import CoachingSupport from './dashboard/CoachingSupport';
import ResultsActions from './dashboard/ResultsActions';
import RecommendedSteps from './dashboard/RecommendedSteps';
import SkillGapChart from './SkillGapChart';
import AIInsights from './dashboard/AIInsights';
import { calculateAverageGap } from '../utils/assessmentCalculations/averages';
import { getTopStrengths, getLowestSkills } from '../utils/assessmentCalculations/skillMetrics';

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
  // Debug received categories with more detailed logging
  useEffect(() => {
    console.log("ResultsDashboard - Received categories count:", categories?.length || 0);
    
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
  }, [categories]);
  
  // Calculate metrics with extra error handling
  let averageGap = 0;
  let strengths = [];
  let lowestSkills = [];
  
  try {
    // Ensure we have valid categories before calculations
    if (categories && categories.length > 0 && 
        categories.some(cat => cat && cat.skills && cat.skills.some(skill => 
          skill && skill.ratings && 
          typeof skill.ratings.current === 'number' && 
          typeof skill.ratings.desired === 'number'))) {
      
      console.log("ResultsDashboard - Calculating metrics with valid data");
      averageGap = calculateAverageGap(categories);
      strengths = getTopStrengths(categories, 3);
      lowestSkills = getLowestSkills(categories, 3);
      
      console.log("ResultsDashboard - Metrics calculated:", {
        averageGap,
        strengthsCount: strengths?.length || 0,
        lowestSkillsCount: lowestSkills?.length || 0
      });
    } else {
      console.log("ResultsDashboard - Skipped metrics calculation due to invalid data");
    }
  } catch (error) {
    console.error("ResultsDashboard - Error calculating metrics:", error);
  }

  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Your Leadership Assessment Results</CardTitle>
            <CardDescription>
              Review your leadership competency gaps and development opportunities
            </CardDescription>
          </div>
          <div className="ml-4">
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Leadership Assessment Logo" 
              className="h-28 w-auto" 
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6" id="results-content">
          {/* Profile Summary */}
          <ProfileSummary demographics={demographics} />

          {/* Competency Analysis - Expanded for PDF */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-encourager-accent/20 p-3 rounded-full">
                    <svg className="text-encourager w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-encourager">Competency Analysis</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visualize and analyze your leadership competency gaps and insights
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Radar Chart Section */}
              <div>
                <h3 className="text-xl font-bold text-encourager mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                  Competency Radar Chart
                </h3>
                {categories && categories.length > 0 ? (
                  <div className="h-[600px] w-full">
                    <SkillGapChart categories={categories} />
                  </div>
                ) : (
                  <div className="h-[400px] w-full flex items-center justify-center bg-slate-50 rounded-lg">
                    <p className="text-slate-500 text-center">
                      No category data available for visualization.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Insights Section */}
              <div>
                <h3 className="text-xl font-bold text-encourager mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-Powered Key Insights
                </h3>
                {categories && categories.length > 0 ? (
                  <AIInsights 
                    categories={categories}
                    demographics={demographics}
                    averageGap={averageGap}
                    assessmentId={assessmentId}
                  />
                ) : (
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <p className="text-slate-500 text-center">
                      No assessment data available for AI insights.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recommended Next Steps */}
          <RecommendedSteps />
          
          {/* Coaching Support and Sign Up side by side */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
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
                    Create an account to unlock all features of the Leadership Assessment Tool.
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
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
