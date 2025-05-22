
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LoadResultsButtonProps {
  onLoadPreviousResults: () => void;
  isLoading: boolean;
}

const LoadResultsButton: React.FC<LoadResultsButtonProps> = ({ 
  onLoadPreviousResults,
  isLoading
}) => {
  const { user } = useAuth();
  
  return (
    <div className="mb-6 flex justify-end items-center gap-2">
      {user ? (
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
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="text-encourager border-encourager opacity-70"
                  onClick={onLoadPreviousResults}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircleGauge className="animate-spin mr-2 h-4 w-4" />
                  ) : null}
                  Load Previous Results
                </Button>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="max-w-xs text-sm">Sign in or create an account to access your saved assessment history. Local data is migrated automatically when you sign in.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default LoadResultsButton;
