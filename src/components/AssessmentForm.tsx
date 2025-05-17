
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Skill } from '@/utils/assessmentData';
import LeadershipCategory from './LeadershipCategory';
import { ArrowLeft } from 'lucide-react';

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

  const currentCategoryCompleted = isCategoryCompleted(currentCategory);

  return (
    <div className="fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Leadership Assessment</CardTitle>
          <CardDescription>
            Rate your current and desired leadership skills in each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Category {activeCategory + 1} of {categories.length}
            </div>
            <div className="flex space-x-1">
              {categories.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1 w-6 rounded-full ${index === activeCategory ? 'bg-secondary' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <LeadershipCategory 
        category={currentCategory}
        onSkillRating={handleSkillRating}
      />

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrevCategory}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFirstCategory ? 'Back to Demographics' : 'Previous'}
        </Button>
        <Button
          onClick={handleNextCategory}
          disabled={!currentCategoryCompleted}
        >
          {isLastCategory ? 'View Results' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default AssessmentForm;
