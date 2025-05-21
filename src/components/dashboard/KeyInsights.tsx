
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
  // Open all sections by default for debugging
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

  // Calculate insights data with extensive debugging
  console.log("KEY_INSIGHTS - Calculating insights from categories:", categories.length);
  if (categories.length > 0) {
    console.log("KEY_INSIGHTS - First category:", categories[0].title);
    console.log("KEY_INSIGHTS - First category skills count:", categories[0].skills?.length || 0);
    if (categories[0]?.skills?.length > 0) {
      const firstSkill = categories[0].skills[0];
      console.log("KEY_INSIGHTS - First skill sample:", JSON.stringify(firstSkill));
      console.log("KEY_INSIGHTS - First skill ratings:", JSON.stringify(firstSkill.ratings));
      console.log("KEY_INSIGHTS - First skill ratings types - current:", typeof firstSkill.ratings.current, "desired:", typeof firstSkill.ratings.desired);
    }
  }
  
  // Generate raw data counts for debugging
  const skillsWithRatings = categories.reduce((count, category) => {
    if (!category.skills) return count;
    return count + category.skills.filter(skill => 
      (skill.ratings?.current > 0 || skill.ratings?.desired > 0)
    ).length;
  }, 0);
  
  const categoriesWithRatings = categories.filter(category => 
    category.skills?.some(skill => skill.ratings?.current > 0 || skill.ratings?.desired > 0)
  ).length;
  
  console.log(`KEY_INSIGHTS - Skills with ratings: ${skillsWithRatings}/${categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)}`);
  console.log(`KEY_INSIGHTS - Categories with ratings: ${categoriesWithRatings}/${categories.length}`);
  
  const largestCategoryGaps = getLargestCategoryGaps(categories, 3);
  const smallestCategoryGaps = getSmallestCategoryGaps(categories, 3);
  const skillsToImprove = getSkillsToImprove(categories, 3);
  const skillsMeetingExpectations = getSkillsMeetingExpectations(categories, 3);
  
  useEffect(() => {
    console.log("KEY_INSIGHTS - DETAILED DEBUG INFO:");
    console.log("KEY_INSIGHTS - Average Gap:", averageGap);
    console.log("KEY_INSIGHTS - Largest Gaps:", largestCategoryGaps);
    console.log("KEY_INSIGHTS - Smallest Gaps:", smallestCategoryGaps);
    console.log("KEY_INSIGHTS - Skills to Improve:", skillsToImprove);
    console.log("KEY_INSIGHTS - Skills Meeting Expectations:", skillsMeetingExpectations);
    
    // Debug raw categories data for comprehensive analysis
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        console.log(`KEY_INSIGHTS - Category: ${category.title}`);
        if (category.skills && category.skills.length > 0) {
          category.skills.forEach(skill => {
            const current = Number(skill.ratings?.current || 0);
            const desired = Number(skill.ratings?.desired || 0);
            const gap = Math.abs(desired - current);
            console.log(`KEY_INSIGHTS - Skill: ${skill.name}, Current: ${current}, Desired: ${desired}, Gap: ${gap}`);
          });
        }
      });
    }
  }, [averageGap, largestCategoryGaps, smallestCategoryGaps, skillsToImprove, skillsMeetingExpectations, categories]);

  // Format numbers to display with 2 decimal places
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return String(num);
  };

  // Use actual gap value
  const displayAverageGap = formatNumber(averageGap);

  return (
    <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
      <div className="flex items-start gap-3">
        <BookOpen className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Key Insights</h3>
          <p className="text-sm text-slate-500 mb-3">Based on your 1-10 rating scale assessment</p>
          
          {/* Enhanced debug output */}
          <div className="bg-amber-50 p-3 mb-4 rounded text-xs">
            <p><strong>Debug Info:</strong> Raw Average Gap: {averageGap}</p>
            <p>Top Category Gap: {largestCategoryGaps[0]?.gap || 'N/A'}</p>
            <p>Skill count: {categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)}</p>
            <p>Skills with ratings: {skillsWithRatings}</p>
            <p>Categories with data: {categoriesWithRatings}/{categories.length}</p>
            {categories.length > 0 && categories[0].skills?.length > 0 && (
              <>
                <p className="mt-1"><strong>First skill sample:</strong></p>
                <p>Name: {categories[0].skills[0].name}</p>
                <p>Current: {categories[0].skills[0].ratings?.current} ({typeof categories[0].skills[0].ratings?.current})</p>
                <p>Desired: {categories[0].skills[0].ratings?.desired} ({typeof categories[0].skills[0].ratings?.desired})</p>
              </>
            )}
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
