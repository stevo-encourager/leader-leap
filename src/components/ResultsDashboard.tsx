
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentTypes';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import KeyInsights from './dashboard/KeyInsights';
import EncouragerCoaching from './dashboard/EncouragerCoaching';
import ResultsActions from './dashboard/ResultsActions';
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

          {/* Detailed Analysis - Now displayed first */}
          <DetailedAnalysis categories={categories} />

          {/* Key Insights - Now displayed after Detailed Analysis */}
          <KeyInsights 
            averageGap={averageGap} 
            strengths={strengths} 
            lowestSkills={lowestSkills} 
          />

          {/* Combined Encourager Coaching section */}
          <EncouragerCoaching />
        </CardContent>
        <CardFooter>
          <ResultsActions 
            onBack={onBack} 
            onRestart={onRestart} 
            onSignup={onSignup} 
          />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
