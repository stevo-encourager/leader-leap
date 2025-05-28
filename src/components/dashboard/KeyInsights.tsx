
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { 
  SkillWithMetadata,
  getSkillsToImprove
} from '@/utils/assessmentCalculations';
import { Category, Demographics } from '@/utils/assessmentTypes';
import SkillsToImproveSection from './insights/SkillsToImproveSection';

interface KeyInsightsProps {
  averageGap: number;
  strengths: SkillWithMetadata[];
  lowestSkills: SkillWithMetadata[];
  categories: Category[];
  demographics?: Demographics;
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ 
  averageGap, 
  strengths,
  lowestSkills,
  categories,
  demographics = {}
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  const [skillsToImprove, setSkillsToImprove] = useState<SkillWithMetadata[]>([]);
  
  useEffect(() => {
    if (!safeCategories || safeCategories.length === 0) {
      return;
    }
    
    try {
      const skills = getSkillsToImprove(safeCategories, 3) || [];
      setSkillsToImprove(skills);
    } catch (error) {
      console.error("KeyInsights - Error calculating skills to improve:", error);
      setSkillsToImprove([]);
    }
  }, [safeCategories]);

  const formatNumber = (num: number | string): string => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return String(num);
  };

  const skillsWithRatings = safeCategories.reduce((count, category) => {
    if (!category || !category.skills) return count;
    return count + category.skills.filter(skill => 
      skill && skill.ratings && (
        (typeof skill.ratings.current === 'number' && !isNaN(skill.ratings.current) && skill.ratings.current > 0) || 
        (typeof skill.ratings.desired === 'number' && !isNaN(skill.ratings.desired) && skill.ratings.desired > 0)
      )
    ).length;
  }, 0);

  return (
    <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-encourager-accent/20 p-3 rounded-full">
          <BookOpen className="text-encourager" size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-encourager">Skills & Competencies to Work On</h2>
          <p className="text-sm text-slate-500 mt-1">Development recommendations based on your assessment</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {skillsWithRatings > 0 ? (
          <SkillsToImproveSection 
            skills={skillsToImprove}
            isOpen={true}
            onToggle={() => {}}
            formatNumber={formatNumber}
            averageGap={formatNumber(averageGap)}
          />
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No assessment data available to display insights.</p>
            <p className="text-sm mt-1">Please complete the assessment to see your development opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyInsights;
