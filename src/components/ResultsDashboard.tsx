
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import KeyInsights from './dashboard/KeyInsights';
import CoachingSupport from './dashboard/CoachingSupport';
import ResultsActions from './dashboard/ResultsActions';
import RecommendedSteps from './dashboard/RecommendedSteps';
import { calculateAverageGap } from '../utils/assessmentCalculations/averages';
import { getTopStrengths, getLowestSkills } from '../utils/assessmentCalculations/skillMetrics';

interface ResultsDashboardProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup?: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  categories, 
  demographics, 
  onRestart, 
  onBack,
  onSignup
}) => {
  // Debug received categories
  useEffect(() => {
    console.log("ResultsDashboard - Received categories:", categories);
    
    // Check if categories have skills and ratings
    if (categories && categories.length > 0) {
      console.log("ResultsDashboard - First category:", categories[0]);
      
      if (categories[0].skills && categories[0].skills.length > 0) {
        console.log("ResultsDashboard - First skill:", categories[0].skills[0]);
      }
      
      // Check data quality for calculations
      const hasActualData = categories.some(cat => 
        cat.skills && cat.skills.some(skill => 
          skill.ratings && (
            (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) || 
            (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0)
          )
        )
      );
      
      console.log(`ResultsDashboard - Has actual rating data: ${hasActualData}`);
    }
  }, [categories]);
  
  // Calculate metrics with extra error handling
  let averageGap = 0;
  let strengths = [];
  let lowestSkills = [];
  
  try {
    console.log("ResultsDashboard - Calculating metrics...");
    averageGap = calculateAverageGap(categories);
    console.log("ResultsDashboard - Average gap calculated:", averageGap);
    
    strengths = getTopStrengths(categories, 3);
    console.log("ResultsDashboard - Strengths calculated:", strengths?.length || 0);
    
    lowestSkills = getLowestSkills(categories, 3);
    console.log("ResultsDashboard - Lowest skills calculated:", lowestSkills?.length || 0);
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

          {/* Detailed Analysis */}
          <DetailedAnalysis categories={categories} />

          {/* Key Insights */}
          <KeyInsights 
            averageGap={averageGap} 
            strengths={strengths} 
            lowestSkills={lowestSkills}
            categories={categories}
          />
          
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
