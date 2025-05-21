
import { useState, useEffect } from 'react';
import { getAssessmentById } from '@/services/assessmentService';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { normalizeCategories } from '@/utils/resultNormalizer';

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
    if (!assessmentId) return;
    
    const fetchSpecificAssessment = async () => {
      setLoadingSpecificAssessment(true);
      try {
        const result = await getAssessmentById(assessmentId);
        console.log("Specific assessment fetch result:", result);
        
        if (result.success && result.data) {
          // Extract and properly type the categories and demographics
          const categoriesData = result.data.categories as unknown as Category[];
          const demographicsData = result.data.demographics as unknown as Demographics;
          
          // Ensure categories is an array
          if (categoriesData && Array.isArray(categoriesData)) {
            console.log("Successfully loaded assessment data with categories:", categoriesData);
            
            // Use the normalizeCategories utility to process the data properly
            const normalizedCategories = normalizeCategories(categoriesData);
            console.log("Normalized categories:", normalizedCategories);
            
            setSpecificAssessmentData({
              categories: normalizedCategories,
              demographics: demographicsData || {}
            });
          } else {
            console.error("Invalid categories data format:", categoriesData);
            toast({
              title: "Error loading assessment",
              description: "The assessment data format is invalid",
              variant: "destructive",
            });
            navigate('/previous-assessments');
          }
        } else {
          console.error("Failed to fetch assessment:", result.error);
          toast({
            title: "Error loading assessment",
            description: result.error || "Failed to load the requested assessment",
            variant: "destructive",
          });
          navigate('/previous-assessments');
        }
      } catch (error) {
        console.error("Error fetching specific assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load the assessment",
          variant: "destructive",
        });
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
