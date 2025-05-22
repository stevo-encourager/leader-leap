
import React from 'react';
import { ArrowLeft, Download, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResultsActionsProps {
  onBack: () => void;
  onRestart: () => void;
  onSignup?: () => void;
}

const ResultsActions: React.FC<ResultsActionsProps> = ({ 
  onBack, 
  onRestart, 
  onSignup 
}) => {
  const { user } = useAuth();
  
  // PDF export function
  const handleExportPDF = () => {
    // Don't show an error for guest users, just perform the action
    // or prompt to sign up if that's truly required
    if (!user) {
      try {
        exportToPDF(
          'results-content',
          'leadership-assessment-results.pdf'
        );
        
        // Inform guest users that they can sign up to save permanently
        toast({
          title: "PDF downloaded",
          description: "Sign up to save your results permanently in your account.",
        });
        
        // Optionally show signup form if provided
        if (onSignup) {
          setTimeout(() => {
            onSignup();
          }, 2000); // Delay to allow user to see the first toast
        }
      } catch (error) {
        console.error('Error exporting PDF:', error);
        toast({
          title: "Error exporting PDF",
          description: "There was an issue creating your PDF.",
          variant: "destructive",
        });
      }
      return;
    }
    
    // For logged-in users, proceed normally
    exportToPDF(
      'results-content',
      'leadership-assessment-results.pdf'
    );
  };

  const handleNewAssessment = () => {
    onRestart();
  };
  
  return (
    <div className="flex justify-between w-full">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessment
      </Button>
      <div className="flex gap-2">
        {!user && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={onSignup}
                  className="flex items-center gap-2"
                >
                  Sign Up
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="max-w-xs text-sm">Create an account to save your results and access them anytime</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button 
          variant="encourager" 
          className="flex items-center gap-2"
          onClick={handleExportPDF}
        >
          <Download className="h-4 w-4" />
          {user ? 'Download PDF' : 'Save as PDF'}
        </Button>
        <Button onClick={handleNewAssessment}>
          <Plus className="mr-2 h-4 w-4" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

export default ResultsActions;
