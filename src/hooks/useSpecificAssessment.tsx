
import { useState, useEffect } from 'react';
import { getAssessmentById } from '@/services/assessment/fetchAssessment';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useNavigate } from 'react-router-dom';
import { 
  validateAndNormalizeCategories, 
  handleAssessmentDataError 
} from '@/utils/assessmentValidation';

interface UseSpecificAssessmentReturn {
  loadingSpecificAssessment: boolean;
  specificAssessmentData: { 
    categories: Category[], 
    demographics: Demographics 
  } | null;
  error: string | null;
}

export const useSpecificAssessment = (assessmentId: string | undefined): UseSpecificAssessmentReturn => {
  const [loadingSpecificAssessment, setLoadingSpecificAssessment] = useState(false);
  const [specificAssessmentData, setSpecificAssessmentData] = useState<{ 
    categories: Category[], 
    demographics: Demographics 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!assessmentId) {
      console.log('useSpecificAssessment - No assessmentId provided');
      setSpecificAssessmentData(null);
      setError(null);
      return;
    }
    
    console.log('useSpecificAssessment - Fetching assessment with id:', assessmentId);
    
    const fetchSpecificAssessment = async () => {
      setLoadingSpecificAssessment(true);
      setError(null);
      setSpecificAssessmentData(null);
      
      try {
        console.log('useSpecificAssessment - Starting fetch for assessment:', assessmentId);
        const result = await getAssessmentById(assessmentId);
        console.log("useSpecificAssessment - Raw fetch result:", result);
        
        if (result.success && result.data) {
          console.log("useSpecificAssessment - Fetch successful, processing data");
          
          // Extract and validate categories data
          const rawCategoriesData = result.data.categories;
          console.log("useSpecificAssessment - Raw categories data:", rawCategoriesData);
          console.log("useSpecificAssessment - Categories data type:", typeof rawCategoriesData);
          console.log("useSpecificAssessment - Categories is array:", Array.isArray(rawCategoriesData));
          
          // Extract demographics data
          const demographicsData = result.data.demographics as unknown as Demographics || {};
          console.log("useSpecificAssessment - Demographics data:", demographicsData);
          
          // Validate and normalize categories with enhanced logging
          console.log("useSpecificAssessment - About to validate categories");
          const normalizedCategories = validateAndNormalizeCategories(rawCategoriesData);
          console.log("useSpecificAssessment - Validation result:", {
            hasCategories: !!normalizedCategories,
            categoriesLength: normalizedCategories?.length || 0,
            firstCategoryTitle: normalizedCategories?.[0]?.title || 'none'
          });
          
          if (normalizedCategories && normalizedCategories.length > 0) {
            console.log("useSpecificAssessment - Setting valid assessment data");
            
            // Log some details about the skills for debugging
            let totalSkills = 0;
            let skillsWithRatings = 0;
            normalizedCategories.forEach(cat => {
              if (cat.skills) {
                totalSkills += cat.skills.length;
                skillsWithRatings += cat.skills.filter(skill => 
                  skill.ratings && (skill.ratings.current > 0 || skill.ratings.desired > 0)
                ).length;
              }
            });
            
            console.log(`useSpecificAssessment - Assessment contains ${totalSkills} total skills, ${skillsWithRatings} with ratings`);
            
            setSpecificAssessmentData({
              categories: normalizedCategories,
              demographics: demographicsData
            });
            setError(null);
          } else {
            console.error("useSpecificAssessment - Failed to validate categories");
            setError("invalid-format");
            setSpecificAssessmentData(null);
          }
        } else {
          console.error("useSpecificAssessment - Failed to fetch assessment:", result.error);
          setError(result.error || "fetch-error");
          setSpecificAssessmentData(null);
        }
      } catch (error) {
        console.error("useSpecificAssessment - Error fetching specific assessment:", error);
        setError("fetch-error");
        setSpecificAssessmentData(null);
      } finally {
        setLoadingSpecificAssessment(false);
      }
    };
    
    fetchSpecificAssessment();
  }, [assessmentId, navigate]);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('useSpecificAssessment - State update:', {
      assessmentId,
      loading: loadingSpecificAssessment,
      hasData: !!specificAssessmentData,
      categoriesCount: specificAssessmentData?.categories?.length || 0,
      error
    });
  }, [assessmentId, loadingSpecificAssessment, specificAssessmentData, error]);

  return {
    loadingSpecificAssessment,
    specificAssessmentData,
    error
  };
};
