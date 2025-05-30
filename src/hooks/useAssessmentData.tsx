
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

  useEffect(() => {
    console.log('useAssessmentData - Effect triggered with:', {
      assessmentId: assessmentId || 'none',
      hasSpecificAssessment: !!specificAssessment,
      specificAssessmentCategories: specificAssessment?.categories?.length || 0,
      loadingSpecificAssessment,
      contextCategoriesLength: contextCategories?.length || 0,
      contextCategoriesArray: Array.isArray(contextCategories)
    });

    setIsAssessmentDataLoading(true);
    
    const debug: any = {
      timestamp: new Date().toISOString(),
      assessmentId: assessmentId || 'none',
      isSpecificAssessment: !!assessmentId,
      isLoadingSpecificData: loadingSpecificAssessment,
      specificDataAvailable: !!specificAssessment?.categories,
      contextCategoriesAvailable: Array.isArray(contextCategories) && contextCategories.length > 0,
      contextCategoriesCount: Array.isArray(contextCategories) ? contextCategories.length : 0,
      dataSource: null
    };
    
    try {
      let sourcedCategories: Category[] = [];
      let sourcedDemographics: Demographics = {};
      
      // Case 1: Viewing a specific assessment AND data is available
      if (assessmentId && specificAssessment && specificAssessment.categories) {
        console.log("useAssessmentData - Using specific assessment data");
        debug.dataSource = "specific_assessment";
        
        if (Array.isArray(specificAssessment.categories)) {
          sourcedCategories = specificAssessment.categories;
          console.log("useAssessmentData - Specific assessment has", sourcedCategories.length, "categories");
        } else if (typeof specificAssessment.categories === 'object') {
          console.log("useAssessmentData - Converting specific assessment categories from object to array");
          sourcedCategories = Object.values(specificAssessment.categories);
          debug.categoriesConvertedFromObject = true;
        }
        
        if (specificAssessment.demographics) {
          sourcedDemographics = specificAssessment.demographics;
        }
        
      } else if (assessmentId && loadingSpecificAssessment) {
        // Still loading specific assessment
        console.log("useAssessmentData - Still loading specific assessment");
        debug.dataSource = "loading_specific";
        setDebugData(debug);
        return;
        
      } else if (assessmentId && !loadingSpecificAssessment && !specificAssessment && contextCategories && contextCategories.length > 0) {
        // CRITICAL FIX: Specific assessment failed to load (likely auth error), but we have context categories
        console.log("useAssessmentData - Specific assessment failed to load, falling back to context categories");
        debug.dataSource = "context_fallback_from_failed_specific";
        sourcedCategories = contextCategories;
        sourcedDemographics = contextDemographics || {};
        
      } else if (!assessmentId && contextCategories && contextCategories.length > 0) {
        // Case 2: Using categories from current context (just completed assessment)
        console.log("useAssessmentData - Using categories from context");
        debug.dataSource = "context_assessment";
        sourcedCategories = contextCategories;
        sourcedDemographics = contextDemographics || {};
        
      } else {
        // Case 3: Try to get from local storage as fallback
        console.log("useAssessmentData - Trying to load from local storage");
        const localData = getLocalAssessmentData();
        if (localData && localData.categories && localData.categories.length > 0) {
          console.log("useAssessmentData - Using data from local storage");
          debug.dataSource = "local_storage";
          sourcedCategories = localData.categories;
          sourcedDemographics = localData.demographics || {};
        } else {
          console.warn("useAssessmentData - No valid data source available");
          debug.dataSource = "none";
        }
      }
      
      console.log("useAssessmentData - Processing categories:", {
        source: debug.dataSource,
        categoriesLength: sourcedCategories?.length || 0,
        isArray: Array.isArray(sourcedCategories)
      });
      
      if (Array.isArray(sourcedCategories) && sourcedCategories.length > 0) {
        // Deep clone and validate the categories
        const processedCategories = JSON.parse(JSON.stringify(sourcedCategories));
        
        const cleanedCategories = processedCategories
          .filter((category: any) => category && typeof category === 'object')
          .map((category: any) => {
            const validCategory: Category = {
              id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
              title: category.title || 'Unknown Category',
              description: category.description || '',
              skills: []
            };
            
            if (category.skills && Array.isArray(category.skills)) {
              validCategory.skills = category.skills
                .filter((skill: any) => skill && typeof skill === 'object')
                .map((skill: any) => {
                  const processedSkill = {
                    id: skill.id || `skill-${Math.random().toString(36).substring(2, 9)}`,
                    name: skill.name || skill.competency || 'Unnamed Skill',
                    description: skill.description || '',
                    ratings: {
                      current: 0,
                      desired: 0
                    }
                  };
                  
                  if (skill.ratings) {
                    const current = Number(skill.ratings.current);
                    const desired = Number(skill.ratings.desired);
                    processedSkill.ratings.current = isNaN(current) ? 0 : current;
                    processedSkill.ratings.desired = isNaN(desired) ? 0 : desired;
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
        
        console.log("useAssessmentData - Processed ratings count:", processedRatingsCount);
        debug.processedRatingsCount = processedRatingsCount;
        
        setDisplayCategories(cleanedCategories);
        setDisplayDemographics(sourcedDemographics || {});
        setIsAssessmentDataValid(cleanedCategories.length > 0);
        
        debug.categoriesProcessed = cleanedCategories.length;
        debug.valid = cleanedCategories.length > 0;
      } else {
        console.warn("useAssessmentData - No valid categories data found");
        setDisplayCategories([]);
        setIsAssessmentDataValid(false);
        
        debug.valid = false;
        debug.error = "No valid categories data found";
      }
    } catch (error) {
      console.error("useAssessmentData - Error processing assessment data:", error);
      setDisplayCategories([]);
      setIsAssessmentDataValid(false);
      
      debug.valid = false;
      debug.error = `Error processing data: ${error}`;
    } finally {
      setIsAssessmentDataLoading(false);
      
      debug.finalCategoriesLength = displayCategories.length;
      debug.isValid = isAssessmentDataValid;
      setDebugData(debug);
      
      console.log('useAssessmentData - Final debug data:', debug);
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
