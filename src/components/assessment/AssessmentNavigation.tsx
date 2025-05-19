
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AssessmentNavigationProps {
  isFirstCategory: boolean;
  isLastCategory: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const AssessmentNavigation: React.FC<AssessmentNavigationProps> = ({
  isFirstCategory,
  isLastCategory,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        className="border-encourager hover:bg-encourager-lightgray hover:text-encourager"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isFirstCategory ? 'Back to Demographics' : 'Previous'}
      </Button>
      <Button
        onClick={onNext}
        className="bg-encourager hover:bg-encourager-light"
      >
        {isLastCategory ? 'View Results' : 'Next'}
      </Button>
    </div>
  );
};

export default AssessmentNavigation;
