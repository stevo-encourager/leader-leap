
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge, Info, ServerIcon, Laptop } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getLocalAssessmentData } from '@/services/assessment/manageAssessmentHistory';

interface LoadResultsButtonProps {
  onLoadPreviousResults: () => void;
  isLoading: boolean;
}

const LoadResultsButton: React.FC<LoadResultsButtonProps> = ({ 
  onLoadPreviousResults,
  isLoading
}) => {
  const { user } = useAuth();
  const [hasLocalData, setHasLocalData] = useState<boolean>(false);
  
  // Check if there's local data available
  useEffect(() => {
    const localData = getLocalAssessmentData();
    setHasLocalData(
      !!(localData && localData.categories && 
         localData.categories.length > 0 && 
         // Check if any skill has non-zero ratings
         localData.categories.some(category => 
           category.skills && category.skills.some(skill => 
             skill.ratings && (skill.ratings.current > 0 || skill.ratings.desired > 0)
           )
         )
      )
    );
  }, []);
  
  return (
    <div className="mb-6 flex justify-end items-center gap-2">
      <Button 
        variant="outline" 
        className="text-encourager border-encourager"
        onClick={onLoadPreviousResults}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircleGauge className="animate-spin mr-2 h-4 w-4" />
        ) : (
          user ? (
            <ServerIcon className="mr-2 h-4 w-4" />
          ) : (
            <Laptop className="mr-2 h-4 w-4" />
          )
        )}
        Load Previous Results
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-slate-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="max-w-xs text-sm">
              {user 
                ? (hasLocalData 
                    ? "You're signed in. Your assessment history is stored in your account."
                    : "You're signed in. Your assessment history is stored in your account.")
                : (hasLocalData
                    ? "Your assessments are stored temporarily in this browser. Create an account to save them permanently."
                    : "Create an account to save your assessment history.")
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LoadResultsButton;
