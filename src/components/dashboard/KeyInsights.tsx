
import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { 
  SkillWithMetadata,
  CategoryWithMetadata,
  getLargestCategoryGaps,
  getSkillsToImprove
} from '@/utils/assessmentCalculations';
import { Category, Demographics } from '@/utils/assessmentTypes';
import InsightSummary from './insights/InsightSummary';
import LargestGapsSection from './insights/LargestGapsSection';
import SkillsToImproveSection from './insights/SkillsToImproveSection';
import { logger } from '@/utils/productionLogger';

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
    
    
          // Log first category details if available
      if (safeCategories && safeCategories.length > 0) {
        const firstCategory = safeCategories[0];
        
        if (firstCategory?.skills && firstCategory.skills.length > 0) {
          const firstSkill = firstCategory.skills[0];
        }
      }
  }, [safeCategories, averageGap, strengths, lowestSkills]);
  
  // Compute derived data once categories are available
  useEffect(() => {
    if (!safeCategories || safeCategories.length === 0) {
      return;
    }
    
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
        
        return count + categoryCount;
      }, 0);
      
      // Only calculate insights if we have actual data
      if (skillsWithRatings > 0) {
        // Safely calculate insights
        const largestCategoryGaps = getLargestCategoryGaps(safeCategories, 3) || [];
        const skillsToImprove = getSkillsToImprove(safeCategories, 3) || [];
        
        setInsightData({
          largestCategoryGaps,
          skillsToImprove
        });
      }
    } catch (error) {
      logger.error("KeyInsights - Error calculating insights:", error);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-encourager-accent/20 p-3 rounded-full">
          <BookOpen className="text-encourager" size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#3a6859' }}>Skills & Competencies to Work On</h2>
          <p className="text-sm text-slate-500 mt-1">Development recommendations based on your assessment</p>
        </div>
      </div>
      
      <div className="space-y-6">
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
  );
};

export default KeyInsights;
