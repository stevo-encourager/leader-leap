
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
  
  // Enhanced validation to check if we actually have assessment data
  const hasValidAssessmentData = () => {
    console.log('ResultsActions: Checking for valid assessment data...');
    console.log('ResultsActions: categories length:', categories?.length || 0);
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.log('ResultsActions: No categories or empty array');
      return false;
    }
    
    let skillsWithRatings = 0;
    let totalRatingValues = 0;
    
    categories.forEach(category => {
      if (category && category.skills && Array.isArray(category.skills)) {
        category.skills.forEach(skill => {
          if (skill && skill.ratings) {
            const currentRating = skill.ratings.current;
            const desiredRating = skill.ratings.desired;
            
            if (typeof currentRating === 'number' && currentRating > 0) {
              totalRatingValues++;
            }
            if (typeof desiredRating === 'number' && desiredRating > 0) {
              totalRatingValues++;
            }
            
            if ((typeof currentRating === 'number' && currentRating > 0) || 
                (typeof desiredRating === 'number' && desiredRating > 0)) {
              skillsWithRatings++;
            }
          }
        });
      }
    });
    
    console.log('ResultsActions: Validation results:', {
      skillsWithRatings,
      totalRatingValues,
      isValid: skillsWithRatings > 0 && totalRatingValues > 0
    });
    
    return skillsWithRatings > 0 && totalRatingValues > 0;
  };
  
  // PDF export function using the new simplified approach
  const handleExportPDF = () => {
    console.log('ResultsActions: PDF export button clicked');
    console.log('ResultsActions: categories received:', categories?.length || 0);
    console.log('ResultsActions: demographics received:', demographics ? Object.keys(demographics) : 'none');
    
    if (!hasValidAssessmentData()) {
      toast({
        title: "Cannot Export PDF",
        description: "No completed assessment data available. Please complete the assessment with actual ratings first.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('ResultsActions: Data validation passed, calling exportToPDF...');
    
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
      console.error('ResultsActions: Error calling exportToPDF:', error);
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
          disabled={!hasValidAssessmentData()}
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
