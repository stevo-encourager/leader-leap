
import React, { useState, useEffect } from 'react';
import { Category } from '@/utils/assessmentData';
import LeadershipCategory from './LeadershipCategory';
import AssessmentHeader from './assessment/AssessmentHeader';
import AssessmentNavigation from './assessment/AssessmentNavigation';
import CategoryProgressHeader from './assessment/CategoryProgressHeader';
import MidpointProgressMessage from './assessment/MidpointProgressMessage';
import { useToast } from '@/hooks/use-toast';

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
  const [showMidpointMessage, setShowMidpointMessage] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if we should show the engagement message when active category changes
  useEffect(() => {
    const midpoint = Math.floor(categories.length / 2);
    if (activeCategory === midpoint && !showMidpointMessage) {
      setShowMidpointMessage(true);
    }
  }, [activeCategory, categories.length, showMidpointMessage]);

  const handleSkillRating = (categoryId: string, skillId: string, type: 'current' | 'desired', value: number) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        const updatedSkills = category.skills.map(skill => {
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

    onCategoriesUpdate(updatedCategories);
  };

  const handleNextCategory = () => {
    if (activeCategory < categories.length - 1) {
      setActiveCategory(activeCategory + 1);
      window.scrollTo(0, 0);
    } else {
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

  const currentCategory = categories[activeCategory];
  const isLastCategory = activeCategory === categories.length - 1;
  const isFirstCategory = activeCategory === 0;

  const isCategoryCompleted = (category: Category): boolean => {
    return category.skills.every(skill => 
      skill.ratings.current > 0 && skill.ratings.desired > 0
    );
  };

  // For informational purposes
  const currentCategoryCompleted = isCategoryCompleted(currentCategory);
  
  const handleCloseMidpointMessage = () => {
    setShowMidpointMessage(false);
  };

  return (
    <div className="fade-in">
      <AssessmentHeader />
      
      <CategoryProgressHeader 
        activeCategory={activeCategory}
        totalCategories={categories.length}
        currentCategory={currentCategory}
      />

      <div className="mt-8">
        <LeadershipCategory 
          category={currentCategory}
          onSkillRating={handleSkillRating}
          hideHeader={true}
        />
      </div>

      <AssessmentNavigation 
        isFirstCategory={isFirstCategory}
        isLastCategory={isLastCategory}
        onPrevious={handlePrevCategory}
        onNext={handleNextCategory}
      />

      {showMidpointMessage && (
        <MidpointProgressMessage onClose={handleCloseMidpointMessage} />
      )}
    </div>
  );
};

export default AssessmentForm;
