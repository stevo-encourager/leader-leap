import React from 'react';
import { CircleGauge, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category, Skill } from '@/utils/assessmentTypes';
import LeadershipCategory from './LeadershipCategory';
import CategoryHeader from './assessment/CategoryHeader';
import CategoryNavigationControls from './assessment/CategoryNavigationControls';
import MidpointDialog from './assessment/MidpointDialog';
import ValidationErrorDisplay from './assessment/ValidationErrorDisplay';
import HelpButton from './assessment/HelpButton';
import { useAssessmentForm } from '@/hooks/useAssessmentForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentFormProps {
  categories: Category[];
  onCategoriesUpdate: (updatedCategories: Category[]) => void;
  onComplete: () => void;
  onBack: () => void;
  initialActiveCategory?: number;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  categories,
  onCategoriesUpdate,
  onComplete,
  onBack,
  initialActiveCategory
}) => {
  const {
    activeCategory,
    dataValidationError,
    showMidpointDialog,
    setShowMidpointDialog,
    handleNextCategory,
    handlePrevCategory,
    isCategoryCompleted
  } = useAssessmentForm(categories, initialActiveCategory);

  const isMobile = useIsMobile();

  console.log("AssessmentForm rendering, about to render HelpButton");

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
    }
  };

  // If we have a data validation error, show an error message
  if (dataValidationError) {
    return <ValidationErrorDisplay error={dataValidationError} onBack={onBack} />;
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
  const isCategoryComplete = isCategoryCompleted(currentCategory);

  console.log("Rendering HelpButton in header section");

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className={`font-bold text-white flex items-center gap-2 bg-encourager px-4 py-2 rounded-md ${
            isMobile ? 'text-xl max-w-[280px] leading-tight' : 'text-3xl'
          }`}>
            <CircleGauge className="text-white" size={isMobile ? 20 : 28} strokeWidth={1.5} />
            <span className={isMobile ? 'whitespace-pre-line' : ''}>
              {isMobile ? 'Leadership\nAssessment Tool' : 'Leadership Assessment Tool'}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {isMobile ? (
            <img 
              src="/encouragerfavicon.png" 
              alt="Company Logo" 
              className="h-20" 
            />
          ) : (
            <img 
              src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
              alt="Company Logo" 
              className="h-24" 
            />
          )}
        </div>
      </div>
      
      <CategoryHeader 
        category={currentCategory}
        activeCategory={activeCategory}
        totalCategories={categories.length}
      />

      <div className="mt-8">
        <LeadershipCategory 
          category={currentCategory}
          onSkillRating={handleSkillRating}
          hideHeader={true}
        />
      </div>

      <CategoryNavigationControls 
        activeCategory={activeCategory}
        totalCategories={categories.length}
        onPrevCategory={() => handlePrevCategory(onBack)}
        onNextCategory={() => handleNextCategory(onComplete)}
        isFirstCategory={isFirstCategory}
        isLastCategory={isLastCategory}
        isCategoryComplete={isCategoryComplete}
      />

      <MidpointDialog 
        open={showMidpointDialog} 
        onOpenChange={setShowMidpointDialog} 
      />
    </div>
  );
};

export default AssessmentForm;
