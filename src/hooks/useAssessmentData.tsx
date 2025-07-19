
import { useState, useEffect } from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

export const useAssessmentData = (
  assessmentId: string | undefined,
  specificAssessment: any,
  loadingSpecificAssessment: boolean,
  contextCategories: Category[],
  contextDemographics: Demographics
) => {
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  const [displayDemographics, setDisplayDemographics] = useState<Demographics>({});
  const [isAssessmentDataValid, setIsAssessmentDataValid] = useState<boolean>(false);
  const [isAssessmentDataLoading, setIsAssessmentDataLoading] = useState<boolean>(true);
  const [debugData, setDebugData] = useState<any>(null);

  // Process the raw categories data to ensure it's valid
  useEffect(() => {
    // Start by setting loading state
    setIsAssessmentDataLoading(true);
    
    // Prepare debug info object
    const debug: any = {
      timestamp: new Date().toISOString(),
      assessmentId: assessmentId || 'none',
      isSpecificAssessment: !!assessmentId,
      isLoadingSpecificData: loadingSpecificAssessment,
      specificDataAvailable: !!specificAssessment,
      contextCategoriesAvailable: Array.isArray(contextCategories) && contextCategories.length > 0,
      contextCategoriesCount: Array.isArray(contextCategories) ? contextCategories.length : 0,
      dataSource: null
    };
    
    try {
      let sourcedCategories: Category[] = [];
      let sourcedDemographics: Demographics = {};
      
      // Determine the source of our data
      if (assessmentId && specificAssessment && specificAssessment.categories) {
        // Case 1: Viewing a specific saved assessment
        debug.dataSource = "specific_assessment";
        
        // Ensure categories is an array
        if (Array.isArray(specificAssessment.categories)) {
          sourcedCategories = specificAssessment.categories;
        } else if (typeof specificAssessment.categories === 'object') {
          sourcedCategories = Object.values(specificAssessment.categories);
          debug.categoriesConvertedFromObject = true;
        }
        // Demographics
        if (specificAssessment.demographics) {
          sourcedDemographics = specificAssessment.demographics;
        }
      } else {
        // Case 2: Using categories from current context (just completed assessment)
        debug.dataSource = "context_assessment";
        sourcedCategories = contextCategories;
        sourcedDemographics = contextDemographics || {};
      }
      

      
      // Count initial ratings for debugging
      let ratingsCount = 0;
      if (Array.isArray(sourcedCategories)) {
        sourcedCategories.forEach(cat => {
          if (cat && cat.skills && Array.isArray(cat.skills)) {
            cat.skills.forEach(skill => {
              if (skill && skill.ratings) {
                if (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) ratingsCount++;
                if (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0) ratingsCount++;
              }
            });
          }
        });
      }
      debug.initialRatingsCount = ratingsCount;
      
      // Process and validate the data
      if (Array.isArray(sourcedCategories) && sourcedCategories.length > 0) {
        // Deep clone to avoid any reference issues
        const processedCategories = JSON.parse(JSON.stringify(sourcedCategories));
        
        // Clean and normalize the categories and skills
        const cleanedCategories = processedCategories
          .filter((category: any) => category && typeof category === 'object')
          .map((category: any) => {
            // Ensure category has all required fields
            const validCategory: Category = {
              id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
              title: category.title || 'Unknown Category',
              description: category.description || '',
              skills: []
            };
            
            // Process skills if they exist
            if (category.skills && Array.isArray(category.skills)) {
              validCategory.skills = category.skills
                .filter((skill: any) => skill && typeof skill === 'object')
                .map((skill: any) => {
                  // Process skill data
                  const processedSkill = {
                    id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
                    name: skill.name || skill.competency || 'Unnamed Skill',
                    description: skill.description || '',
                    ratings: {
                      current: 0,
                      desired: 0
                    }
                  };
                  
                  // Process ratings - CRITICAL: Convert all values to numbers
                  if (skill.ratings) {
                    // Handle current rating - explicitly ensure we store a number
                    if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
                      const current = Number(skill.ratings.current);
                      processedSkill.ratings.current = isNaN(current) ? 0 : current;
                      
                      // Log non-zero ratings for debugging
                      if (current > 0) {
                        // Rating is valid
                      }
                    }
                    
                    // Handle desired rating - explicitly ensure we store a number
                    if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
                      const desired = Number(skill.ratings.desired);
                      processedSkill.ratings.desired = isNaN(desired) ? 0 : desired;
                      
                      // Log non-zero ratings for debugging
                      if (desired > 0) {
                        // Rating is valid
                      }
                    }
                  }
                  
                  return processedSkill;
                });
            }
            
            return validCategory;
          });
        
        // Count processed ratings for debugging
        let processedRatingsCount = 0;
        cleanedCategories.forEach((cat: Category) => {
          if (cat.skills) {
            cat.skills.forEach(skill => {
              if (skill.ratings) {
                if (typeof skill.ratings.current === 'number' && skill.ratings.current > 0) processedRatingsCount++;
                if (typeof skill.ratings.desired === 'number' && skill.ratings.desired > 0) processedRatingsCount++;
              }
            });
          }
        });
        debug.processedRatingsCount = processedRatingsCount;
        
        // Set the data and mark as valid
        setDisplayCategories(cleanedCategories);
        setDisplayDemographics(sourcedDemographics || {});
        setIsAssessmentDataValid(cleanedCategories.length > 0);
        
        // Update debug data
        debug.categoriesProcessed = cleanedCategories.length;
        debug.valid = cleanedCategories.length > 0;
      } else {
        // No valid categories data
    
        setDisplayCategories([]);
        setIsAssessmentDataValid(false);
        
        // Update debug data
        debug.valid = false;
        debug.error = "No valid categories data found";
      }
    } catch (error) {
      console.error("useAssessmentData - Error processing assessment data:", error);
      setDisplayCategories([]);
      setIsAssessmentDataValid(false);
      
      // Update debug data
      debug.valid = false;
      debug.error = `Error processing data: ${error}`;
    } finally {
      // Finish loading
      setIsAssessmentDataLoading(false);
      
      // Update debug info
      debug.finalCategoriesLength = displayCategories.length;
      debug.isValid = isAssessmentDataValid;
      setDebugData(debug);
    }
  }, [assessmentId, specificAssessment, loadingSpecificAssessment, contextCategories, contextDemographics]);

  return {
    displayCategories,
    displayDemographics,
    isAssessmentDataValid,
    isAssessmentDataLoading,
    debugData
  };
};
