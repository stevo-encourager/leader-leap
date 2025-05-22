
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvalidResultsMessageProps {
  onRestart: () => void;
  onBack?: () => void;
  errorType?: string | null;
}

const InvalidResultsMessage: React.FC<InvalidResultsMessageProps> = ({ 
  onRestart, 
  onBack,
  errorType 
}) => {
  let errorMessage = "This may be due to incomplete assessment data or a problem during the assessment process.";
  
  // Customize message based on error type
  if (errorType === "invalid-format") {
    errorMessage = "The assessment data format is invalid or corrupted.";
  } else if (errorType === "fetch-error") {
    errorMessage = "There was a problem retrieving the assessment data from the server.";
  } else if (errorType === "missing-skills") {
    errorMessage = "The assessment data is missing required skill information.";
  }

  return (
    <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50 max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-red-500 mb-4">Unable to display results: Invalid assessment data</h3>
      <p className="text-sm text-gray-600 mb-4">
        {errorMessage}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          className="bg-encourager hover:bg-encourager-light"
          onClick={onRestart}
        >
          Start New Assessment
        </Button>
        
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Back to Previous Assessments
          </Button>
        )}
      </div>
    </div>
  );
};

export default InvalidResultsMessage;
