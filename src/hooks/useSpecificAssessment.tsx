
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
          // Extract categories and demographics data
          const rawCategoriesData = result.data.categories;
          const demographicsData = result.data.demographics as unknown as Demographics || {};
          
          console.log("Raw categories data:", rawCategoriesData);
          
          // Ensure we have proper categories data to work with
          if (rawCategoriesData) {
            // Convert to proper type and normalize
            const categoriesArray = Array.isArray(rawCategoriesData) 
              ? rawCategoriesData 
              : [rawCategoriesData];
              
            console.log("Categories array before normalization:", categoriesArray);
            
            // Apply thorough normalization to ensure consistent data structure
            const normalizedCategories = normalizeCategories(categoriesArray as unknown as Category[]);
            
            console.log("Normalized categories:", normalizedCategories);
            
            // Verify we have valid data after normalization
            if (normalizedCategories && normalizedCategories.length > 0) {
              setSpecificAssessmentData({
                categories: normalizedCategories,
                demographics: demographicsData
              });
            } else {
              console.error("Normalization failed to produce valid categories");
              toast({
                title: "Error loading assessment",
                description: "The assessment data format is invalid",
                variant: "destructive",
              });
              navigate('/previous-assessments');
            }
          } else {
            console.error("No categories data found in the assessment");
            toast({
              title: "Error loading assessment",
              description: "The assessment doesn't contain categories data",
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
        navigate('/previous-assessments');
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
