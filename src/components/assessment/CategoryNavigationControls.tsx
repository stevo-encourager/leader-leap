import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        onClick={onNextCategory}
        className="bg-encourager hover:bg-encourager-light"
        disabled={!isCategoryComplete}
        title={!isCategoryComplete ? "Please rate all skills in this category" : ""}
      >
        {isLastCategory ? 'View Results' : 'Next'}
      </Button>
    </div>
  );
};

export default CategoryNavigationControls;
