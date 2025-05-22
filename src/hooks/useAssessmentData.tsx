
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
  
  // Determine which categories and demographics to use
  const rawCategories = assessmentId && specificAssessmentData 
    ? specificAssessmentData.categories 
    : currentCategories || [];
    
  const rawDemographics = assessmentId && specificAssessmentData 
    ? specificAssessmentData.demographics 
    : currentDemographics || {};

  // Process and validate categories
  useEffect(() => {
    console.log("useAssessmentData - Raw categories:", JSON.stringify(rawCategories));
    console.log("useAssessmentData - Categories length:", rawCategories?.length || 0);
    
    // Ensure categories is an array
    if (!rawCategories || !Array.isArray(rawCategories)) {
      console.warn("useAssessmentData - Categories is not an array:", rawCategories);
      setIsAssessmentDataValid(false);
      setProcessedCategories([]);
      return;
    }
    
    // Process categories
    const processed = rawCategories.map(category => {
      // Check if category is valid
      if (!category || typeof category !== 'object') {
        console.warn("useAssessmentData - Invalid category:", category);
        return null;
      }
      
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
          .map(skill => {
            // Skip invalid skills
            if (!skill || typeof skill !== 'object') {
              return null;
            }
            
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
              const current = typeof skill.ratings.current === 'number' 
                ? skill.ratings.current 
                : parseFloat(String(skill.ratings.current || '0'));
                
              const desired = typeof skill.ratings.desired === 'number' 
                ? skill.ratings.desired 
                : parseFloat(String(skill.ratings.desired || '0'));
              
              processedSkill.ratings.current = isNaN(current) ? 0 : current;
              processedSkill.ratings.desired = isNaN(desired) ? 0 : desired;
            }
            
            // Only include skills with valid ratings
            if (processedSkill.ratings.current > 0 || processedSkill.ratings.desired > 0) {
              return processedSkill;
            }
            
            return null;
          })
          .filter(Boolean) as any; // Filter out null values
      }
      
      // Only include categories with valid skills
      if (processedCategory.skills.length > 0) {
        return processedCategory;
      }
      
      return null;
    }).filter(Boolean) as Category[]; // Filter out null values
    
    setProcessedCategories(processed);
    
    // Check if we have any valid data
    const hasValidData = processed.length > 0 && processed.some(category => 
      category.skills && category.skills.some(skill => 
        skill.ratings && (skill.ratings.current > 0 || skill.ratings.desired > 0)
      )
    );
    
    console.log("useAssessmentData - Processed categories:", JSON.stringify(processed));
    console.log("useAssessmentData - Has valid data:", hasValidData);
    
    setIsAssessmentDataValid(hasValidData);
  }, [rawCategories]);

  return {
    displayCategories: processedCategories,
    displayDemographics: rawDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading: loadingSpecificData
  };
};
