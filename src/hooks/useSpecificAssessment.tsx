
import { useState, useEffect } from 'react';
import { getAssessmentById } from '@/services/assessmentService';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { toast } from '@/hooks/use-toast';
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
}

export const useSpecificAssessment = (assessmentId: string | undefined): UseSpecificAssessmentReturn => {
  const [loadingSpecificAssessment, setLoadingSpecificAssessment] = useState(false);
  const [specificAssessmentData, setSpecificAssessmentData] = useState<{ 
    categories: Category[], 
    demographics: Demographics 
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!assessmentId) {
      console.log('useSpecificAssessment - No assessmentId provided');
      return;
    }
    
    console.log('useSpecificAssessment - Fetching assessment with id:', assessmentId);
    
    const fetchSpecificAssessment = async () => {
      setLoadingSpecificAssessment(true);
      try {
        const result = await getAssessmentById(assessmentId);
        console.log("useSpecificAssessment - Raw fetch result:", result);
        
        if (result.success && result.data) {
          // Extract categories data
          const rawCategoriesData = result.data.categories;
          
          // Extract demographics data
          const demographicsData = result.data.demographics as unknown as Demographics || {};
          
          // Validate and normalize categories
          const normalizedCategories = validateAndNormalizeCategories(rawCategoriesData);
          
          if (normalizedCategories) {
            console.log("useSpecificAssessment - Setting assessment data with valid categories");
            setSpecificAssessmentData({
              categories: normalizedCategories,
              demographics: demographicsData
            });
          } else {
            console.error("useSpecificAssessment - Failed to validate categories");
            handleAssessmentDataError("invalid-format", navigate);
          }
        } else {
          console.error("useSpecificAssessment - Failed to fetch assessment:", result.error);
          handleAssessmentDataError("fetch-error", navigate);
        }
      } catch (error) {
        console.error("useSpecificAssessment - Error fetching specific assessment:", error);
        handleAssessmentDataError("fetch-error", navigate);
      } finally {
        setLoadingSpecificAssessment(false);
      }
    };
    
    fetchSpecificAssessment();
  }, [assessmentId, navigate]);

  return {
    loadingSpecificAssessment,
    specificAssessmentData
  };
};
