import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Skill } from '@/utils/assessmentTypes';
import LeadershipCategory from './LeadershipCategory';
import { ArrowLeft, CircleGauge, Gauge, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateCategoriesData } from '@/utils/assessmentData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay
} from "@/components/ui/dialog";

interface AssessmentFormProps {
  categories: Category[];
  onCategoriesUpdate: (updatedCategories: Category[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  categories,
  onCategoriesUpdate,
  onComplete,
  onBack
}) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [showMidpointDialog, setShowMidpointDialog] = useState<boolean>(false);
  const [midpointDialogShown, setMidpointDialogShown] = useState<boolean>(false);
  const [dataValidationError, setDataValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Validate categories data on component mount
  useEffect(() => {
    console.log("AssessmentForm - Validating categories data:", categories);
    console.log("AssessmentForm - Total categories:", categories?.length || 0);
    
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
      console.log("AssessmentForm - First category skills:", categories[0]?.skills);
      setDataValidationError(null);
    }
  }, [categories, toast]);

  // Check if we should show the engagement message when active category changes
  useEffect(() => {
    // Ensure categories is valid before calculating midpoint
    if (!categories || categories.length === 0) {
      console.error("AssessmentForm - No valid categories available");
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

  const handleSkillRating = (categoryId: string, skillId: string, type: 'current' | 'desired', value: number) => {
    console.log(`Updating skill rating: category=${categoryId}, skill=${skillId}, type=${type}, value=${value}`);
    
    // Add safety check for categories
    if (!categories || !Array.isArray(categories)) {
      console.error("AssessmentForm - handleSkillRating: categories is not an array");
      return;
    }
    
    try {
      const updatedCategories = categories.map(category => {
        if (!category) return category;
        
        if (category.id === categoryId) {
          // Safety check for skills array
          if (!category.skills || !Array.isArray(category.skills)) {
            console.error(`AssessmentForm - handleSkillRating: category ${categoryId} has no skills array`);
            return category;
          }
          
          const updatedSkills = category.skills.map(skill => {
            if (!skill) return skill;
            
            if (skill.id === skillId) {
              return {
                ...skill,
                ratings: {
                  ...skill.ratings,
                  [type]: value
                }
              };
            }
            return skill;
          });
          return {
            ...category,
            skills: updatedSkills
          };
        }
        return category;
      });

      // Log the update to verify data changes
      const updatedSkill = updatedCategories
        .find(cat => cat?.id === categoryId)
        ?.skills?.find(skill => skill?.id === skillId);
        
      console.log("Updated skill:", updatedSkill);
      
      onCategoriesUpdate(updatedCategories);
    } catch (error) {
      console.error("Error updating skill rating:", error);
      toast({
        title: "Error updating rating",
        description: "An error occurred while updating the skill rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextCategory = () => {
    console.log(`Navigating from category ${activeCategory} to ${activeCategory + 1}. Total categories: ${categories.length}`);
    
    if (activeCategory < categories.length - 1) {
      setActiveCategory(activeCategory + 1);
      window.scrollTo(0, 0);
    } else {
      // Log categories before completing to verify data
      console.log("Completing assessment with categories:", categories);
      onComplete();
    }
  };

  const handlePrevCategory = () => {
    if (activeCategory > 0) {
      setActiveCategory(activeCategory - 1);
      window.scrollTo(0, 0);
    } else {
      onBack();
    }
  };
  
  // If we have a data validation error, show an error message
  if (dataValidationError) {
    return (
      <div className="fade-in">
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            <h3 className="font-bold">Data Validation Error</h3>
          </div>
          <p className="mt-2">{dataValidationError}</p>
          <p className="mt-2 text-sm">Please return to the home page and try starting the assessment again.</p>
          <Button onClick={onBack} variant="destructive" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Add safety check for currentCategory
  if (!categories || !Array.isArray(categories) || categories.length === 0 || activeCategory >= categories.length) {
    console.error("AssessmentForm - Invalid categories or activeCategory out of bounds");
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
        <h3 className="font-bold mb-2">Error Loading Assessment</h3>
        <p>There was a problem loading the assessment data. Please try again.</p>
        <Button onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }

  const currentCategory = categories[activeCategory];
  
  // Add additional safety check for currentCategory
  if (!currentCategory) {
    console.error("AssessmentForm - currentCategory is undefined");
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
        <h3 className="font-bold mb-2">Error Loading Category</h3>
        <p>There was a problem loading this category. Please try again.</p>
        <Button onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }
  
  const isLastCategory = activeCategory === categories.length - 1;
  const isFirstCategory = activeCategory === 0;

  const isCategoryCompleted = (category: Category): boolean => {
    // Add safety check for skills
    if (!category || !category.skills || !Array.isArray(category.skills)) {
      console.warn(`isCategoryCompleted: Category ${category?.title || 'unknown'} has invalid skills`);
      return false;
    }
    
    return category.skills.every(skill => 
      skill && 
      skill.ratings &&
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    );
  };

  // We'll still calculate this for informational purposes, but won't use it to disable the button
  const currentCategoryCompleted = isCategoryCompleted(currentCategory);
  const progressPercentage = Math.round(((activeCategory + 1) / categories.length) * 100);

  // Return the JSX form + UI
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2 bg-encourager px-4 py-2 rounded-md">
          <CircleGauge className="text-white" size={28} strokeWidth={1.5} />
          Leadership Assessment Tool
        </h1>
        <img 
          src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
          alt="Company Logo" 
          className="h-24" 
        />
      </div>
      
      <Card className="mb-10 encourager-card">
        <CardContent className="p-6 bg-encourager-lightgray">
          <div className="flex justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              Competency {activeCategory + 1} of {categories.length}
            </div>
            <div className="flex space-x-1">
              {categories.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 w-6 rounded-full ${index === activeCategory ? 'bg-encourager' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <CardTitle className="text-2xl text-[#242323] encourager-header">{currentCategory.title}</CardTitle>
          <CardDescription className="text-encourager-gray">
            {currentCategory.description}
          </CardDescription>
        </CardContent>
      </Card>

      <div className="mt-8">
        <LeadershipCategory 
          category={currentCategory}
          onSkillRating={handleSkillRating}
          hideHeader={true}
        />
      </div>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevCategory}
          className="border-encourager hover:bg-encourager-lightgray hover:text-encourager"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFirstCategory ? 'Back to Demographics' : 'Previous'}
        </Button>
        <Button
          onClick={handleNextCategory}
          className="bg-encourager hover:bg-encourager-light"
        >
          {isLastCategory ? 'View Results' : 'Next'}
        </Button>
      </div>

      {/* Midpoint Dialog with blurred backdrop */}
      <Dialog open={showMidpointDialog} onOpenChange={setShowMidpointDialog}>
        <DialogOverlay className="backdrop-blur-md bg-black/30" />
        <DialogContent className="max-w-md">
          <div className="bg-encourager h-1.5 w-1/2 absolute top-0 left-0"></div>
          
          <DialogHeader className="pt-4 items-center">
            <div className="h-16 w-16 rounded-full bg-encourager-lightgray flex items-center justify-center text-encourager mb-4">
              <Gauge className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-playfair font-semibold text-center text-encourager-gray">
              Halfway There!
            </DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex items-center justify-center gap-1 text-encourager font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>50% Complete</span>
              </div>
              <p className="mt-3 text-encourager-gray">
                You're making excellent progress on your assessment. Keep providing thoughtful responses to ensure you get the most accurate results.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col">
            <Button 
              onClick={() => setShowMidpointDialog(false)}
              className="bg-encourager hover:bg-encourager-light w-full"
            >
              Continue Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentForm;
