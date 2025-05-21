
import React, { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { 
  SkillWithMetadata, 
  getLargestGaps, 
  getSmallestGaps, 
  getSkillsToImprove,
  getSkillsMeetingExpectations 
} from '@/utils/assessmentCalculations';
import { Category } from '@/utils/assessmentTypes';

interface KeyInsightsProps {
  averageGap: number;
  strengths: SkillWithMetadata[];
  lowestSkills: SkillWithMetadata[];
  categories: Category[];
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ 
  averageGap, 
  strengths,
  lowestSkills,
  categories
}) => {
  const largestGaps = getLargestGaps(categories, 3);
  const smallestGaps = getSmallestGaps(categories, 3);
  const skillsToImprove = getSkillsToImprove(categories, 3);
  const skillsMeetingExpectations = getSkillsMeetingExpectations(categories, 3);
  
  useEffect(() => {
    console.log("KeyInsights - Props received:", { 
      averageGap, 
      largestGaps,
      smallestGaps,
      skillsToImprove,
      skillsMeetingExpectations,
      categoriesCount: categories?.length || 0 
    });
  }, [averageGap, largestGaps, smallestGaps, skillsToImprove, skillsMeetingExpectations, categories]);

  // Format numbers to display with 2 decimal places
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return String(num);
  };

  // Fallback to meaningful default values if zeros are detected
  const displayAverageGap = averageGap === 0 && categories?.some(c => 
    c.skills?.some(s => s.ratings?.current > 0 || s.ratings?.desired > 0)
  ) ? 'Calculating...' : formatNumber(averageGap);

  return (
    <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
      <div className="flex items-start gap-3">
        <BookOpen className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Key Insights</h3>
          
          <div className="bg-primary/5 p-4 rounded-lg mb-4">
            <p className="text-sm">
              Based on your assessment, your average competency gap is <span className="font-bold">{displayAverageGap}</span> points.
              This indicates the typical difference between your current abilities and how important these competencies are to your role.
            </p>
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Largest Competency Gaps <span className="font-normal">(areas with greatest difference between current and desired)</span></h4>
          <div className="space-y-3 mb-4">
            {largestGaps && largestGaps.length > 0 && largestGaps.some(skill => skill.gap > 0) ? (
              largestGaps.map((skill) => (
                <div key={`largest-gap-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Gap: {formatNumber(skill.gap)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  You need to complete an assessment with different current and desired values to identify competency gaps.
                </p>
              </div>
            )}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Individual Skills You Want to Improve <span className="font-normal">(skills with high desired values)</span></h4>
          <div className="space-y-3 mb-4">
            {skillsToImprove && skillsToImprove.length > 0 ? (
              skillsToImprove.map((skill) => (
                <div key={`improve-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-amber-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Desired: {formatNumber(skill.ratings.desired)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  Complete an assessment to identify skills you want to improve.
                </p>
              </div>
            )}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Smallest Competency Gaps <span className="font-normal">(areas with smallest difference between current and desired)</span></h4>
          <div className="space-y-3 mb-4">
            {smallestGaps && smallestGaps.length > 0 ? (
              smallestGaps.map((skill) => (
                <div key={`small-gap-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Gap: {formatNumber(skill.gap)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  Complete an assessment to identify your smallest competency gaps.
                </p>
              </div>
            )}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Individual Skills Meeting Your Expectations <span className="font-normal">(skills with high current values)</span></h4>
          <div className="space-y-3">
            {skillsMeetingExpectations && skillsMeetingExpectations.length > 0 ? (
              skillsMeetingExpectations.map((skill) => (
                <div key={`meeting-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-blue-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Current: {formatNumber(skill.ratings.current)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  Complete an assessment to identify skills meeting your expectations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyInsights;
