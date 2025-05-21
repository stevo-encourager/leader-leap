
import React, { useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { SkillWithMetadata, getLargestGaps } from '@/utils/assessmentCalculations';
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
  
  useEffect(() => {
    console.log("KeyInsights - Props received:", { 
      averageGap, 
      strengths, 
      lowestSkills, 
      largestGaps,
      categoriesCount: categories?.length || 0 
    });
    
    // More detailed logging to debug the zero values issue
    if (categories && categories.length > 0) {
      console.log("KeyInsights - First category sample:", categories[0]);
      if (categories[0].skills && categories[0].skills.length > 0) {
        console.log("KeyInsights - First skill sample:", categories[0].skills[0]);
        console.log("KeyInsights - First skill ratings:", categories[0].skills[0].ratings);
      }
    }
    
    if (lowestSkills && lowestSkills.length > 0) {
      console.log("KeyInsights - Lowest skills sample:", lowestSkills[0]);
    }
    
    if (largestGaps && largestGaps.length > 0) {
      console.log("KeyInsights - Largest gaps sample:", largestGaps[0]);
    }
  }, [averageGap, strengths, lowestSkills, largestGaps, categories]);

  // Fallback to meaningful default values if zeros are detected
  const displayAverageGap = averageGap === 0 && categories?.some(c => 
    c.skills?.some(s => s.ratings?.current > 0 || s.ratings?.desired > 0)
  ) ? 'Calculating...' : averageGap;

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
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Lowest Rated Skills <span className="font-normal">(areas that need the most development)</span></h4>
          <div className="space-y-3 mb-4">
            {lowestSkills && lowestSkills.length > 0 && lowestSkills.some(skill => skill.ratings.current > 0) ? (
              lowestSkills.map((skill) => (
                <div key={`lowest-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Current: {skill.ratings.current}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  You need to complete an assessment with ratings greater than 0 to identify your lowest rated skills.
                </p>
              </div>
            )}
          </div>
          
          <h4 className="text-md font-medium mt-4 mb-2">Your Largest Skills Gaps <span className="font-normal">(areas with greatest difference between current and desired)</span></h4>
          <div className="space-y-3 mb-4">
            {largestGaps && largestGaps.length > 0 && largestGaps.some(skill => skill.gap > 0) ? (
              largestGaps.map((skill) => (
                <div key={`skill-gap-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Gap: {skill.gap}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-secondary/10 p-3 rounded-lg">
                <p className="text-sm text-slate-500">
                  You need to complete an assessment with different current and desired values to identify skill gaps.
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
