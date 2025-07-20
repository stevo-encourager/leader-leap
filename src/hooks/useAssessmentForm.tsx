
import { useState, useEffect } from 'react';
import { Category } from '@/utils/assessmentTypes';
import { validateCategoriesData } from '@/utils/assessmentData';
import { useToast } from './use-toast';

export const useAssessmentForm = (categories: Category[], initialActiveCategory?: number) => {
  const [activeCategory, setActiveCategory] = useState<number>(initialActiveCategory || 0);
  const [showMidpointDialog, setShowMidpointDialog] = useState<boolean>(false);
  const [midpointDialogShown, setMidpointDialogShown] = useState<boolean>(false);
  const [dataValidationError, setDataValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Validate categories data on component mount
  useEffect(() => {
    
    
    if (!validateCategoriesData(categories)) {
      setDataValidationError("Invalid assessment data structure");
      toast({
        title: "Data validation error",
        description: "The assessment data has an invalid structure. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    
    if (categories && categories.length > 0) {
  
      setDataValidationError(null);
    }
  }, [categories, toast]);

  // Check if we should show the engagement message when active category changes
  useEffect(() => {
    // Ensure categories is valid before calculating midpoint
    if (!categories || categories.length === 0) {
  
      return;
    }
    
    const midpoint = Math.floor(categories.length / 2);
    
    // Only show the dialog if:
    // 1. We're at the midpoint category
    // 2. The dialog hasn't been shown yet in this session
    if (activeCategory === midpoint && !midpointDialogShown) {
      setShowMidpointDialog(true);
      setMidpointDialogShown(true); // Mark that we've shown it
    }
  }, [activeCategory, categories, midpointDialogShown]);

  const handleNextCategory = (onComplete: () => void) => {
    console.log('handleNextCategory called', { 
      activeCategory, 
      totalCategories: categories.length,
      isLastCategory: activeCategory === categories.length - 1 
    });
    
    // Check if the current category is fully completed before proceeding
    const currentCategory = categories[activeCategory];
    const isCategoryComplete = isCategoryCompleted(currentCategory);
    
    console.log('Category completion check:', {
      categoryId: currentCategory?.id,
      categoryTitle: currentCategory?.title,
      isCategoryComplete,
      skills: currentCategory?.skills?.map(skill => ({
        id: skill.id,
        name: skill.name,
        currentRating: skill.ratings?.current,
        desiredRating: skill.ratings?.desired,
        hasValidRatings: skill.ratings?.current > 0 && skill.ratings?.desired > 0
      }))
    });
    
    if (!isCategoryComplete) {
      toast({
        title: "Incomplete category",
        description: "Please rate all skills in this category before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeCategory < categories.length - 1) {
      console.log('Moving to next category');
      setActiveCategory(activeCategory + 1);
      window.scrollTo(0, 0);
    } else {
      console.log('Last category - checking all categories completion');
      // Verify all categories are completed before finishing assessment
      const completionStatus = categories.map((cat, index) => ({
        index,
        id: cat.id,
        title: cat.title,
        isComplete: isCategoryCompleted(cat)
      }));
      
      console.log('All categories completion status:', completionStatus);
      
      const allCompleted = categories.every(isCategoryCompleted);
      if (!allCompleted) {
        const incompleteCategories = completionStatus.filter(cat => !cat.isComplete);
        console.log('Incomplete categories found:', incompleteCategories);
        toast({
          title: "Incomplete assessment",
          description: "Please ensure all skills in all categories have ratings before completing.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('All validation passed - calling onComplete');
      // Log categories before completing to verify data
      onComplete();
    }
  };

  const handlePrevCategory = (onBack: () => void) => {
    if (activeCategory > 0) {
      setActiveCategory(activeCategory - 1);
      window.scrollTo(0, 0);
    } else {
      onBack();
    }
  };
  
  const isCategoryCompleted = (category: Category): boolean => {
    // Add safety check for skills
    if (!category || !category.skills || !Array.isArray(category.skills)) {
  
      return false;
    }
    
    // Check that every skill has both current and desired ratings
    return category.skills.every(skill => 
      skill && 
      skill.ratings &&
      typeof skill.ratings.current === 'number' && 
      skill.ratings.current > 0 &&
      typeof skill.ratings.desired === 'number' && 
      skill.ratings.desired > 0
    );
  };

  return {
    activeCategory,
    dataValidationError,
    showMidpointDialog,
    setShowMidpointDialog,
    handleNextCategory,
    handlePrevCategory,
    isCategoryCompleted
  };
};
