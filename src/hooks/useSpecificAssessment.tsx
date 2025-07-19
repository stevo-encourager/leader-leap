
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
      return;
    }
    

    
    const fetchSpecificAssessment = async () => {
      setLoadingSpecificAssessment(true);
      setError(null);
      
      try {
        const result = await getAssessmentById(assessmentId);
    
        
        if (result.success && result.data) {
          // Extract categories data
          const rawCategoriesData = result.data.categories;
          
          // Extract demographics data
          const demographicsData = result.data.demographics as unknown as Demographics || {};
          
          // Validate and normalize categories
          const normalizedCategories = validateAndNormalizeCategories(rawCategoriesData);
          
          if (normalizedCategories && normalizedCategories.length > 0) {
        
            setSpecificAssessmentData({
              categories: normalizedCategories,
              demographics: demographicsData
            });
          } else {
            console.error("useSpecificAssessment - Failed to validate categories");
            setError("invalid-format");
          }
        } else {
          console.error("useSpecificAssessment - Failed to fetch assessment:", result.error);
          setError(result.error || "fetch-error");
        }
      } catch (error) {
        console.error("useSpecificAssessment - Error fetching specific assessment:", error);
        setError("fetch-error");
      } finally {
        setLoadingSpecificAssessment(false);
      }
    };
    
    fetchSpecificAssessment();
  }, [assessmentId, navigate]);

  return {
    loadingSpecificAssessment,
    specificAssessmentData,
    error
  };
};
