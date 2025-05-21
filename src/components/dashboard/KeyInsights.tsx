
import React, { useState } from 'react';
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
  // Open all sections by default
  const [openSections, setOpenSections] = useState({
    largestGaps: true,
    skillsToImprove: true,
    smallestGaps: true,
    skillsMeeting: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Calculate insights data
  const largestCategoryGaps = getLargestCategoryGaps(categories, 3);
  const smallestCategoryGaps = getSmallestCategoryGaps(categories, 3);
  const skillsToImprove = getSkillsToImprove(categories, 3);
  const skillsMeetingExpectations = getSkillsMeetingExpectations(categories, 3);

  // Format numbers to display with 2 decimal places
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return String(num);
  };

  // Use actual gap value
  const displayAverageGap = formatNumber(averageGap);

  // Calculate some diagnostic info
  const skillCount = categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
  const skillsWithRatings = categories.reduce((count, category) => {
    if (!category.skills) return count;
    return count + category.skills.filter(skill => 
      (Number(skill.ratings?.current) > 0 || Number(skill.ratings?.desired) > 0)
    ).length;
  }, 0);
  
  const categoriesWithRatings = categories.filter(category => 
    category.skills?.some(skill => 
      Number(skill.ratings?.current) > 0 || Number(skill.ratings?.desired) > 0
    )
  ).length;

  return (
    <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
      <div className="flex items-start gap-3">
        <BookOpen className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Key Insights</h3>
          <p className="text-sm text-slate-500 mb-3">Based on your 1-10 rating scale assessment</p>
          
          {/* Quick diagnostic info panel */}
          <div className="bg-amber-50 p-3 mb-4 rounded text-xs">
            <p><strong>Assessment Status:</strong> {categoriesWithRatings > 0 ? "Data Available" : "No Data"}</p>
            <p>Categories with data: {categoriesWithRatings}/{categories.length}</p>
            <p>Skills with ratings: {skillsWithRatings}/{skillCount}</p>
            <p>Average gap: {averageGap}</p>
          </div>
          
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
