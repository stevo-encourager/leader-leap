
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Skill } from '@/utils/assessmentData';
import LeadershipCategory from './LeadershipCategory';
import { ArrowLeft, CircleGauge } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
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
  const [showEngagementPopover, setShowEngagementPopover] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if we should show the engagement popover when active category changes
  useEffect(() => {
    const midpoint = Math.floor(categories.length / 2);
    if (activeCategory === midpoint && !showEngagementPopover) {
      setShowEngagementPopover(true);
      // Show toast notification as a backup in case popover is dismissed
      toast({
        title: "Making great progress!",
        description: "You're halfway through the assessment. Keep going to see your results!",
        duration: 5000,
      });
    }
  }, [activeCategory, categories.length, showEngagementPopover, toast]);

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

  // We'll still calculate this for informational purposes, but won't use it to disable the button
  const currentCategoryCompleted = isCategoryCompleted(currentCategory);
  const progressPercentage = Math.round(((activeCategory + 1) / categories.length) * 100);

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
              Category {activeCategory + 1} of {categories.length}
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

      {/* Engagement Popover - Will auto-open when triggered by the useEffect */}
      <Popover open={showEngagementPopover} onOpenChange={setShowEngagementPopover}>
        <PopoverTrigger className="hidden">
          {/* Hidden trigger, we'll control it programmatically */}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-5 border-2 border-encourager bg-white">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-encourager mb-2">
              Well done!
            </h3>
            <p className="mb-3">
              You're {progressPercentage}% through the assessment! 
            </p>
            <p className="text-sm text-encourager-gray mb-4">
              Keep going to see your full results and leadership infographic.
            </p>
            <Button 
              onClick={() => setShowEngagementPopover(false)}
              className="bg-encourager hover:bg-encourager-light w-full"
            >
              Continue Assessment
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AssessmentForm;
