
import React from 'react';
import { ArrowLeft, Download, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface ResultsActionsProps {
  onBack: () => void;
  onRestart: () => void;
  onSignup?: () => void;
  categories?: Category[];
  demographics?: Demographics;
}

const ResultsActions: React.FC<ResultsActionsProps> = ({ 
  onBack, 
  onRestart, 
  onSignup,
  categories = [],
  demographics = {}
}) => {
  const { user } = useAuth();
  
  // PDF export function using the new simplified approach
  const handleExportPDF = () => {
    console.log('ResultsActions - PDF export requested with categories:', categories?.length || 0);
    
    if (!categories || categories.length === 0) {
      toast({
        title: "Cannot Export PDF",
        description: "No assessment data available to export. Please complete an assessment first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      exportToPDF(categories, demographics, 'leadership-assessment-results.pdf');
      
      // For guest users, suggest signup after successful export
      if (!user && onSignup) {
        setTimeout(() => {
          toast({
            title: "Save Your Results",
            description: "Sign up to save your results permanently in your account.",
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error exporting PDF",
        description: "There was an issue creating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewAssessment = () => {
    // Notify user that a new assessment is starting
    toast({
      title: "Starting new assessment",
      description: "All previous ratings have been reset to default values.",
    });
    
    // Call the provided restart function
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
