
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
          // Extract and validate categories data
          let rawCategoriesData = result.data.categories;
          console.log("useSpecificAssessment - Raw categories data type:", typeof rawCategoriesData);
          console.log("useSpecificAssessment - Raw categories data:", rawCategoriesData);
          
          // Handle case where categories might be stored as a string
          if (typeof rawCategoriesData === 'string') {
            try {
              rawCategoriesData = JSON.parse(rawCategoriesData);
              console.log("useSpecificAssessment - Parsed categories from string:", rawCategoriesData);
            } catch (e) {
              console.error("useSpecificAssessment - Failed to parse categories string:", e);
            }
          }
          
          // Extract demographics data
          const demographicsData = result.data.demographics as unknown as Demographics || {};
          
          // Ensure we have proper categories data to work with
          if (rawCategoriesData) {
            // Convert to proper type and normalize
            let categoriesArray;
            if (Array.isArray(rawCategoriesData)) {
              categoriesArray = rawCategoriesData;
            } else if (typeof rawCategoriesData === 'object') {
              categoriesArray = Object.values(rawCategoriesData);
            } else {
              categoriesArray = [];
              console.error('useSpecificAssessment - Categories data is in an invalid format');
            }
              
            console.log("useSpecificAssessment - Categories array before normalization:", categoriesArray);
            
            // Apply thorough normalization to ensure consistent data structure
            const normalizedCategories = normalizeCategories(categoriesArray as unknown as Category[]);
            
            console.log("useSpecificAssessment - Normalized categories:", normalizedCategories);
            
            // Verify we have valid data after normalization
            if (normalizedCategories && normalizedCategories.length > 0) {
              // Check if categories have valid skills
              const hasValidSkills = normalizedCategories.some(cat => 
                cat.skills && Array.isArray(cat.skills) && cat.skills.length > 0
              );
              
              if (hasValidSkills) {
                console.log("useSpecificAssessment - Setting assessment data with valid categories");
                setSpecificAssessmentData({
                  categories: normalizedCategories,
                  demographics: demographicsData
                });
              } else {
                console.error("useSpecificAssessment - Normalized categories have no valid skills");
                toast({
                  title: "Incomplete assessment data",
                  description: "The assessment data is missing skill information",
                  variant: "destructive",
                });
                navigate('/previous-assessments');
              }
            } else {
              console.error("useSpecificAssessment - Normalization failed to produce valid categories");
              toast({
                title: "Error loading assessment",
                description: "The assessment data format is invalid",
                variant: "destructive",
              });
              navigate('/previous-assessments');
            }
          } else {
            console.error("useSpecificAssessment - No categories data found in the assessment");
            toast({
              title: "Error loading assessment",
              description: "The assessment doesn't contain categories data",
              variant: "destructive",
            });
            navigate('/previous-assessments');
          }
        } else {
          console.error("useSpecificAssessment - Failed to fetch assessment:", result.error);
          toast({
            title: "Error loading assessment",
            description: result.error || "Failed to load the requested assessment",
            variant: "destructive",
          });
          navigate('/previous-assessments');
        }
      } catch (error) {
        console.error("useSpecificAssessment - Error fetching specific assessment:", error);
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
