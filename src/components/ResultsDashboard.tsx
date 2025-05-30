
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import CoachingSupport from './dashboard/CoachingSupport';
import ResultsActions from './dashboard/ResultsActions';
import RecommendedSteps from './dashboard/RecommendedSteps';
import { calculateAverageGap } from '../utils/assessmentCalculations/averages';

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
          typeof skill.ratings.desired === 'number'))) {
      
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

  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1 pr-4">
            <CardTitle className="text-2xl text-left">Your Leader Leap Assessment Results</CardTitle>
            <CardDescription className="text-left mt-2">
              Review your leadership competency gaps and development opportunities
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Leader Leap Assessment Logo" 
              className="h-28 w-auto" 
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6" id="results-content">
          {/* Profile Summary */}
          <div data-section="profile-summary">
            <ProfileSummary demographics={demographics} />
          </div>

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
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2" data-section="coaching-support">
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
