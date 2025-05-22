
import { useEffect, useState } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface UseAssessmentDataReturn {
  displayCategories: Category[];
  displayDemographics: Demographics;
  isAssessmentDataValid: boolean;
  isAssessmentDataLoading: boolean;
}

/**
 * Hook to manage assessment data display
 * Handles both specific assessment data (from ID) or current assessment data
 */
export const useAssessmentData = (
  assessmentId: string | undefined,
  specificAssessmentData: { categories: Category[], demographics: Demographics } | null,
  loadingSpecificData: boolean,
  currentCategories?: Category[],
  currentDemographics?: Demographics
): UseAssessmentDataReturn => {
  const [isAssessmentDataValid, setIsAssessmentDataValid] = useState(false);
  const [processedCategories, setProcessedCategories] = useState<Category[]>([]);
  const [processedDemographics, setProcessedDemographics] = useState<Demographics>({});
  
  useEffect(() => {
    console.log("useAssessmentData - INIT called with:", {
      hasAssessmentId: !!assessmentId,
      hasSpecificData: !!specificAssessmentData,
      currentCategoriesLength: currentCategories?.length || 0,
      loadingSpecificData
    });
  }, []);
  
  // Determine which categories and demographics to use
  const rawCategories = assessmentId && specificAssessmentData 
    ? specificAssessmentData.categories 
    : currentCategories || [];
    
  const rawDemographics = assessmentId && specificAssessmentData 
    ? specificAssessmentData.demographics 
    : currentDemographics || {};

  // Process and validate categories
  useEffect(() => {
    console.log("useAssessmentData - Processing raw categories:", {
      categoriesLength: rawCategories?.length || 0,
      isArray: Array.isArray(rawCategories),
      firstCategoryTitle: rawCategories && rawCategories[0]?.title
    });
    
    if (rawDemographics) {
      console.log("useAssessmentData - Raw demographics:", rawDemographics);
      setProcessedDemographics(rawDemographics);
    }
    
    // Ensure categories is an array
    if (!rawCategories || !Array.isArray(rawCategories)) {
      console.warn("useAssessmentData - Categories is not an array:", rawCategories);
      setIsAssessmentDataValid(false);
      setProcessedCategories([]);
      return;
    }
    
    // Process categories
    const processed = rawCategories
      .filter(category => category && typeof category === 'object')
      .map(category => {
        // Ensure category has required fields
        const processedCategory: Category = {
          id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
          title: category.title || 'Unknown Category',
          description: category.description || '',
          skills: []
        };
        
        // Process skills if they exist
        if (category.skills && Array.isArray(category.skills)) {
          processedCategory.skills = category.skills
            .filter(skill => skill && typeof skill === 'object')
            .map(skill => {
              // Create a correctly formatted skill
              const processedSkill = {
                id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
                name: skill.name || 'Unknown Skill',
                description: skill.description || '',
                ratings: {
                  current: 0,
                  desired: 0
                }
              };
              
              // Process ratings
              if (skill.ratings) {
                // Parse ratings as numbers with fallback to 0
                let current = 0;
                let desired = 0;
                
                if (typeof skill.ratings.current === 'number') {
                  current = isNaN(skill.ratings.current) ? 0 : skill.ratings.current;
                } else if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
                  current = parseFloat(String(skill.ratings.current));
                  current = isNaN(current) ? 0 : current;
                }
                
                if (typeof skill.ratings.desired === 'number') {
                  desired = isNaN(skill.ratings.desired) ? 0 : skill.ratings.desired;
                } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
                  desired = parseFloat(String(skill.ratings.desired));
                  desired = isNaN(desired) ? 0 : desired;
                }
                
                processedSkill.ratings.current = current;
                processedSkill.ratings.desired = desired;
                
                console.log(`useAssessmentData - Processed skill: ${skill.name}, current=${current}, desired=${desired}`);
              }
              
              return processedSkill;
            })
            .filter(skill => skill.ratings.current > 0 || skill.ratings.desired > 0);
        }
        
        return processedCategory;
      })
      .filter(category => category.skills && category.skills.length > 0);
    
    console.log("useAssessmentData - Processed categories result:", {
      length: processed.length,
      totalSkills: processed.reduce((count, cat) => count + cat.skills.length, 0)
    });
    
    setProcessedCategories(processed);
    
    // Check if we have any valid data
    const hasValidData = processed.length > 0 && processed.some(category => 
      category.skills && category.skills.some(skill => 
        skill.ratings && (skill.ratings.current > 0 || skill.ratings.desired > 0)
      )
    );
    
    console.log("useAssessmentData - Has valid data:", hasValidData);
    setIsAssessmentDataValid(hasValidData);
  }, [rawCategories, rawDemographics]);

  return {
    displayCategories: processedCategories,
    displayDemographics: processedDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading: loadingSpecificData
  };
};
