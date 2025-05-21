
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { 
  SkillWithMetadata,
  CategoryWithMetadata,
  getLargestCategoryGaps,
  getSmallestCategoryGaps,
  getSkillsToImprove,
  getSkillsMeetingExpectations 
} from '@/utils/assessmentCalculations';
import { Category } from '@/utils/assessmentTypes';
import InsightSummary from './insights/InsightSummary';
import LargestGapsSection from './insights/LargestGapsSection';
import SmallestGapsSection from './insights/SmallestGapsSection';
import SkillsToImproveSection from './insights/SkillsToImproveSection';
import SkillsMeetingExpectationsSection from './insights/SkillsMeetingExpectationsSection';

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
  const [openSections, setOpenSections] = useState({
    largestGaps: false,
    skillsToImprove: false,
    smallestGaps: false,
    skillsMeeting: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const largestCategoryGaps = getLargestCategoryGaps(categories, 3);
  const smallestCategoryGaps = getSmallestCategoryGaps(categories, 3);
  const skillsToImprove = getSkillsToImprove(categories, 3);
  const skillsMeetingExpectations = getSkillsMeetingExpectations(categories, 3);
  
  useEffect(() => {
    console.log("KeyInsights - Props received:", { 
      averageGap, 
      largestCategoryGaps,
      smallestCategoryGaps,
      skillsToImprove,
      skillsMeetingExpectations,
      categoriesCount: categories?.length || 0 
    });
  }, [averageGap, largestCategoryGaps, smallestCategoryGaps, skillsToImprove, skillsMeetingExpectations, categories]);

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
          <p className="text-sm text-slate-500 mb-3">Based on your 1-10 rating scale assessment</p>
          
          <InsightSummary averageGap={displayAverageGap} />
          
          {/* Largest Competency Gaps */}
          <LargestGapsSection 
            categoryGaps={largestCategoryGaps}
            isOpen={openSections.largestGaps}
            onToggle={() => toggleSection('largestGaps')}
            formatNumber={formatNumber}
          />
          
          {/* Individual Skills You Want to Improve */}
          <SkillsToImproveSection 
            skills={skillsToImprove}
            isOpen={openSections.skillsToImprove}
            onToggle={() => toggleSection('skillsToImprove')}
            formatNumber={formatNumber}
          />
          
          {/* Your Smallest Competency Gaps */}
          <SmallestGapsSection 
            categoryGaps={smallestCategoryGaps}
            isOpen={openSections.smallestGaps}
            onToggle={() => toggleSection('smallestGaps')}
            formatNumber={formatNumber}
          />
          
          {/* Individual Skills Meeting Your Expectations */}
          <SkillsMeetingExpectationsSection 
            skills={skillsMeetingExpectations}
            isOpen={openSections.skillsMeeting}
            onToggle={() => toggleSection('skillsMeeting')}
            formatNumber={formatNumber}
          />
        </div>
      </div>
    </div>
  );
};

export default KeyInsights;
