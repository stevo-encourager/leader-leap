
import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { exportToPDF } from '@/utils/pdfUtils';

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
    if (!user) {
      toast({
        title: "Sign up required",
        description: "Please sign up to download your results as PDF",
        variant: "destructive",
      });
      
      if (onSignup) {
        onSignup();
      }
      
      return;
    }
    
    exportToPDF(
      'results-content',
      'leadership-assessment-results.pdf'
    );
  };
  
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Assessment
      </Button>
      <div className="flex gap-2">
        <Button 
          variant="encourager" 
          className="flex items-center gap-2"
          onClick={handleExportPDF}
        >
          <Download className="h-4 w-4" />
          {user ? 'Download PDF' : 'Save as PDF'}
        </Button>
        <Button onClick={onRestart}>
          Start New Assessment
        </Button>
      </div>
    </div>
  );
};

export default ResultsActions;
