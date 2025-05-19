
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentData';
import { ArrowLeft } from 'lucide-react';
import ProfileSummary from './dashboard/ProfileSummary';
import DetailedAnalysis from './dashboard/DetailedAnalysis';
import KeyInsights from './dashboard/KeyInsights';
import CoachingSupport from './dashboard/CoachingSupport';
import StrengthsBasedApproach from './dashboard/StrengthsBasedApproach';
import DevelopmentRecommendations from './dashboard/DevelopmentRecommendations';

interface ResultsDashboardProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ categories, demographics, onRestart, onBack }) => {
  // Calculate the average gap for all categories
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);
  const totalGap = categories.reduce((sum, category) => {
    return sum + category.skills.reduce((catSum, skill) => {
      return catSum + Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0));
    }, 0);
  }, 0);
  
  const averageGap = parseFloat((totalGap / totalSkills).toFixed(2));

  // Find the top 3 skills with the largest gaps
  const allSkills = categories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      categoryTitle: category.title,
      gap: parseFloat(Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0)).toFixed(2))
    }))
  );
  
  // Find strengths (highest current ratings)
  const strengths = [...allSkills]
    .sort((a, b) => (b.ratings.current || 0) - (a.ratings.current || 0))
    .slice(0, 3);
    
  // Find lowest scoring competencies
  const lowestSkills = [...allSkills]
    .sort((a, b) => (a.ratings.current || 0) - (b.ratings.current || 0))
    .slice(0, 3);

  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Leadership Assessment Results</CardTitle>
          <CardDescription>
            Review your leadership skill gaps and development opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Coaching Support */}
          <CoachingSupport />

          {/* Strengths-Based Coaching Approach */}
          <StrengthsBasedApproach />

          {/* Development Recommendations */}
          <DevelopmentRecommendations />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
          <Button onClick={onRestart}>
            Start New Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
