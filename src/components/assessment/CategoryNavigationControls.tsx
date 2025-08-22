import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategoryNavigationProps {
  activeCategory: number;
  totalCategories: number;
  onPrevCategory: () => void;
  onNextCategory: () => void;
  isFirstCategory: boolean;
  isLastCategory: boolean;
  isCategoryComplete: boolean;
}

const CategoryNavigationControls: React.FC<CategoryNavigationProps> = ({
  onPrevCategory,
  onNextCategory,
  isFirstCategory,
  isLastCategory,
  isCategoryComplete
}) => {
  const handleNextClick = () => {
    if (!isCategoryComplete) {
      toast({
        title: "Incomplete Competency",
        description: "Please rate all skills in this competency before proceeding.",
        variant: "destructive",
      });
      return;
    }
    onNextCategory();
  };

  return (
    <div className="flex justify-end mt-6">
      {!isFirstCategory && (
        <Button 
          variant="outline" 
          onClick={onPrevCategory}
          className="border-encourager hover:bg-encourager-lightgray hover:text-encourager mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}
      <Button
        onClick={handleNextClick}
        className={`${isCategoryComplete ? 'bg-encourager hover:bg-encourager-light' : 'bg-gray-300 cursor-not-allowed'}`}
        title={!isCategoryComplete ? "Please rate all skills in this category" : ""}
      >
        {isLastCategory ? 'View Results' : 'Next'}
      </Button>
    </div>
  );
};

export default CategoryNavigationControls;
