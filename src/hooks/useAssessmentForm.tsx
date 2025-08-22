
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

  // Handle browser back/forward buttons for assessment navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Check if we're in the assessment step and have category data
      if (categories && categories.length > 0) {
        const categoryIndex = event.state?.categoryIndex ?? 0;
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
          setActiveCategory(categoryIndex);
          window.scrollTo(0, 0);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [categories]);

  // Initialize browser history for assessment navigation
  useEffect(() => {
    if (categories && categories.length > 0) {
      // Check if there's a category parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      
      if (categoryParam !== null) {
        const categoryIndex = parseInt(categoryParam, 10);
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
          setActiveCategory(categoryIndex);
        }
      }
      
      // Initialize the history state for the current category
      const newUrl = `${window.location.pathname}?category=${activeCategory}`;
      const newState = { categoryIndex: activeCategory };
      window.history.replaceState(newState, '', newUrl);
    }
  }, [categories, activeCategory]);

  // Update browser history when active category changes (but not on initial load)
  useEffect(() => {
    if (categories && categories.length > 0 && activeCategory > 0) {
      const newUrl = `${window.location.pathname}?category=${activeCategory}`;
      const newState = { categoryIndex: activeCategory };
      
      // Replace the current history entry instead of pushing a new one
      // This prevents creating too many history entries
      window.history.replaceState(newState, '', newUrl);
    }
  }, [activeCategory, categories]);

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
    
    // Check if the current category is fully completed before proceeding
    const currentCategory = categories[activeCategory];
    const isCategoryComplete = isCategoryCompleted(currentCategory);
    
    if (!isCategoryComplete) {
      toast({
        title: "Incomplete category",
        description: "Please rate all skills in this category before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (activeCategory < categories.length - 1) {
      const nextCategory = activeCategory + 1;
      setActiveCategory(nextCategory);
      
      // Push a new history entry for the next category
      const newUrl = `${window.location.pathname}?category=${nextCategory}`;
      const newState = { categoryIndex: nextCategory };
      window.history.pushState(newState, '', newUrl);
      
      window.scrollTo(0, 0);
    } else {
      // Verify all categories are completed before finishing assessment
      const allCompleted = categories.every(isCategoryCompleted);
      if (!allCompleted) {
        toast({
          title: "Incomplete assessment",
          description: "Please ensure all skills in all categories have ratings before completing.",
          variant: "destructive",
        });
        return;
      }
      
      onComplete();
    }
  };

  const handlePrevCategory = (onBack: () => void) => {
    if (activeCategory > 0) {
      const prevCategory = activeCategory - 1;
      setActiveCategory(prevCategory);
      
      // Push a new history entry for the previous category
      const newUrl = `${window.location.pathname}?category=${prevCategory}`;
      const newState = { categoryIndex: prevCategory };
      window.history.pushState(newState, '', newUrl);
      
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
