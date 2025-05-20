
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import KeyInsights from './dashboard/KeyInsights';
import CoachingSupport from './dashboard/CoachingSupport';
import ResultsActions from './dashboard/ResultsActions';
import RecommendedSteps from './dashboard/RecommendedSteps';
import { calculateAverageGap, getTopStrengths, getLowestSkills } from '../utils/assessmentCalculations';

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
  // Calculate metrics using utility functions
  const averageGap = calculateAverageGap(categories);
  const strengths = getTopStrengths(categories, 3);
  const lowestSkills = getLowestSkills(categories, 3);

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
              className="h-16 w-auto" 
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
          />
          
          {/* Coaching Support and Sign Up side by side */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <CoachingSupport />
            </div>
            <div className="col-span-2">
              {!onSignup ? null : (
                <div className="bg-white p-4 h-full border border-slate-200 rounded-lg shadow-sm">
                  <p className="text-slate-700 mb-4">
                    <strong>Want to save your results, download as PDF, and access them later?</strong><br />
                    Create an account to unlock all features of the Leadership Assessment Tool. <strong>IT'S FREE</strong>
                  </p>
                  <button 
                    className="bg-encourager hover:bg-encourager-light text-white px-4 py-2 rounded-md transition-colors"
                    onClick={onSignup}
                  >
                    Create an Account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <RecommendedSteps />
        </CardContent>
        <CardFooter className="pt-4 pb-6 mt-4 border-t">
          {/* Actions moved to bottom */}
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
