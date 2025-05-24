
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { 
  SkillWithMetadata,
  CategoryWithMetadata,
  getLargestCategoryGaps,
  getSkillsToImprove
} from '@/utils/assessmentCalculations';
import { Category } from '@/utils/assessmentTypes';
import InsightSummary from './insights/InsightSummary';
import LargestGapsSection from './insights/LargestGapsSection';
import SkillsToImproveSection from './insights/SkillsToImproveSection';

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
  // Ensure categories is always an array to prevent "cannot read properties of undefined (reading 'skills')"
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Open all sections by default
  const [openSections, setOpenSections] = useState({
    largestGaps: true,
    skillsToImprove: true
  });
  
  const [insightData, setInsightData] = useState({
    largestCategoryGaps: [] as CategoryWithMetadata[],
    skillsToImprove: [] as SkillWithMetadata[]
  });
  
  // Detailed logging for debugging
  useEffect(() => {
    console.log("KeyInsights - Component mounted with categories:", safeCategories?.length || 0);
    console.log("KeyInsights - Average gap:", averageGap);
    console.log("KeyInsights - Categories data:", safeCategories);
    console.log("KeyInsights - Strengths count:", strengths?.length || 0);
    console.log("KeyInsights - Lowest skills count:", lowestSkills?.length || 0);
    
    // Log first category details if available
    if (safeCategories && safeCategories.length > 0) {
      const firstCategory = safeCategories[0];
      console.log("KeyInsights - First category:", firstCategory?.title);
      
      if (firstCategory?.skills && firstCategory.skills.length > 0) {
        const firstSkill = firstCategory.skills[0];
        console.log("KeyInsights - First skill:", firstSkill?.name);
        console.log("KeyInsights - First skill ratings:", firstSkill?.ratings);
      }
    }
  }, [safeCategories, averageGap, strengths, lowestSkills]);
  
  // Compute derived data once categories are available
  useEffect(() => {
    if (!safeCategories || safeCategories.length === 0) {
      console.log("KeyInsights - No valid categories provided");
      return;
    }
    
    console.log("KeyInsights - Computing insights from categories");
    
    try {
      // Count skills with ratings for diagnostic purposes
      const skillsWithRatings = safeCategories.reduce((count, category) => {
        if (!category || !category.skills) return count;
        
        const categoryCount = category.skills.filter(skill => 
          skill && skill.ratings && (
            (typeof skill.ratings.current === 'number' && !isNaN(skill.ratings.current) && skill.ratings.current > 0) || 
            (typeof skill.ratings.desired === 'number' && !isNaN(skill.ratings.desired) && skill.ratings.desired > 0)
          )
        ).length;
        
        console.log(`KeyInsights - Category ${category.title} has ${categoryCount} skills with ratings`);
        return count + categoryCount;
      }, 0);
      
      console.log(`KeyInsights - Total skills with ratings: ${skillsWithRatings}`);
      
      // Only calculate insights if we have actual data
      if (skillsWithRatings > 0) {
        // Safely calculate insights
        const largestCategoryGaps = getLargestCategoryGaps(safeCategories, 3) || [];
        const skillsToImprove = getSkillsToImprove(safeCategories, 3) || [];
        
        console.log("KeyInsights - Calculated values:", {
          largestCategoryGaps: largestCategoryGaps.length,
          skillsToImprove: skillsToImprove.length
        });
        
        setInsightData({
          largestCategoryGaps,
          skillsToImprove
        });
      } else {
        console.log("KeyInsights - No skills with ratings, skipping calculations");
      }
    } catch (error) {
      console.error("KeyInsights - Error calculating insights:", error);
      // Set empty arrays as fallback
      setInsightData({
        largestCategoryGaps: [],
        skillsToImprove: []
      });
    }
  }, [safeCategories]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format numbers to display with 2 decimal places
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return String(num);
  };

  // Calculate some diagnostic info
  const skillCount = safeCategories.reduce((acc, cat) => {
    if (!cat || !cat.skills) return acc;
    return acc + cat.skills.length;
  }, 0);
  
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
      <div className="flex items-start gap-3">
        <BookOpen className="text-encourager h-5 w-5 mt-1" />
        <div className="w-full">
          <h3 className="text-lg font-medium mb-2 text-slate-700">Skills & Competencies to Work On</h3>
          <p className="text-sm text-slate-500 mb-3">Based on your 1-10 rating scale assessment</p>
          
          {skillsWithRatings > 0 ? (
            <>
              {/* Largest Competency Gaps */}
              <LargestGapsSection 
                categoryGaps={insightData.largestCategoryGaps}
                isOpen={openSections.largestGaps}
                onToggle={() => toggleSection('largestGaps')}
                formatNumber={formatNumber}
                averageGap={formatNumber(averageGap)}
              />
              
              {/* Individual Skills You Want to Improve */}
              <SkillsToImproveSection 
                skills={insightData.skillsToImprove}
                isOpen={openSections.skillsToImprove}
                onToggle={() => toggleSection('skillsToImprove')}
                formatNumber={formatNumber}
                averageGap={formatNumber(averageGap)}
              />
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No assessment data available to display insights.</p>
              <p className="text-sm mt-1">Please complete the assessment to see your development opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyInsights;
