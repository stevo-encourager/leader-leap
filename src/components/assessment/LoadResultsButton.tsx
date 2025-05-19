
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge } from 'lucide-react';

interface LoadResultsButtonProps {
  onLoadPreviousResults: () => void;
  isLoading: boolean;
}

const LoadResultsButton: React.FC<LoadResultsButtonProps> = ({ 
  onLoadPreviousResults,
  isLoading
}) => {
  return (
    <div className="mb-6 flex justify-end">
      <Button 
        variant="outline" 
        className="text-encourager border-encourager"
        onClick={onLoadPreviousResults}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircleGauge className="animate-spin mr-2 h-4 w-4" />
        ) : null}
        Load Previous Results
      </Button>
    </div>
  );
};

export default LoadResultsButton;
