
import { Category, Demographics } from '@/utils/assessmentTypes';
import { normalizeCategories } from '@/utils/resultNormalizer';
import { toast } from '@/hooks/use-toast';
import { logger } from './productionLogger';

/**
 * Validates and normalizes categories data from an assessment
 */
export const validateAndNormalizeCategories = (
  rawCategoriesData: unknown
): Category[] | null => {
  
  // Handle case where categories might be stored as a string
  if (typeof rawCategoriesData === 'string') {
    try {
      rawCategoriesData = JSON.parse(rawCategoriesData);
    } catch (e) {
      logger.error("validateAndNormalizeCategories - Failed to parse categories string:", e);
      return null;
    }
  }
  
  // Ensure we have proper categories data to work with
  if (!rawCategoriesData) {
    logger.error("validateAndNormalizeCategories - No categories data found");
    return null;
  }
  
  // Convert to proper type
  let categoriesArray;
  if (Array.isArray(rawCategoriesData)) {
    categoriesArray = rawCategoriesData;
  } else if (typeof rawCategoriesData === 'object') {
    categoriesArray = Object.values(rawCategoriesData);
  } else {
    logger.error('validateAndNormalizeCategories - Categories data is in an invalid format');
    return null;
  }
  
  // Apply thorough normalization to ensure consistent data structure
  const normalizedCategories = normalizeCategories(categoriesArray as unknown as Category[]);
  
  // Verify we have valid data after normalization
  if (!normalizedCategories || normalizedCategories.length === 0) {
    logger.error("validateAndNormalizeCategories - Normalization failed to produce valid categories");
    return null;
  }
  
  // Check if categories have valid skills
  const hasValidSkills = normalizedCategories.some(cat => 
    cat.skills && Array.isArray(cat.skills) && cat.skills.length > 0
  );
  
  if (!hasValidSkills) {
    logger.error("validateAndNormalizeCategories - Normalized categories have no valid skills");
    return null;
  }
  
  return normalizedCategories;
};

/**
 * Checks if an assessment result is valid
 */
export const isValidAssessmentResult = (categories: Category[] | null): boolean => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return false;
  }
  
  // Check for valid skills
  return categories.some(cat => 
    cat.skills && Array.isArray(cat.skills) && cat.skills.length > 0
  );
};

/**
 * Handles assessment data errors with appropriate toast messages
 */
export const handleAssessmentDataError = (
  error: string, 
  navigate: (path: string) => void
): void => {
  let errorTitle = "Error loading assessment";
  let errorDescription = "There was a problem loading the assessment data.";
  
  switch (error) {
    case "missing-skills":
      errorDescription = "The assessment data is missing skill information";
      break;
    case "invalid-format":
      errorDescription = "The assessment data format is invalid";
      break;
    case "missing-categories":
      errorDescription = "The assessment doesn't contain categories data";
      break;
    case "fetch-error":
      errorDescription = "Failed to load the requested assessment";
      break;
    default:
      errorDescription = "Failed to load the assessment";
  }
  
  toast({
    title: errorTitle,
    description: errorDescription,
    variant: "destructive",
  });
  
  navigate('/profile');
};
