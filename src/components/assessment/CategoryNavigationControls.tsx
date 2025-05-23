
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
}

const CategoryNavigationControls: React.FC<CategoryNavigationProps> = ({
  onPrevCategory,
  onNextCategory,
  isFirstCategory,
  isLastCategory
}) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrevCategory}
        className="border-encourager hover:bg-encourager-lightgray hover:text-encourager"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isFirstCategory ? 'Back to Demographics' : 'Previous'}
      </Button>
      <Button
        onClick={onNextCategory}
        className="bg-encourager hover:bg-encourager-light"
      >
        {isLastCategory ? 'View Results' : 'Next'}
      </Button>
    </div>
  );
};

export default CategoryNavigationControls;
