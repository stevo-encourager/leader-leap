
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvalidResultsMessageProps {
  onRestart: () => void;
  onBack?: () => void;
  errorType?: string | null;
  debugData?: any; // Add debug data parameter
}

const InvalidResultsMessage: React.FC<InvalidResultsMessageProps> = ({ 
  onRestart, 
  onBack,
  errorType,
  debugData
}) => {
  let errorMessage = "This may be due to incomplete assessment data or a problem during the assessment process.";
  let errorTitle = "Unable to display results: Invalid assessment data";
  
  // Customize message based on error type
  if (errorType === "invalid-format") {
    errorMessage = "The assessment data format is invalid or corrupted. Please try completing the assessment again.";
  } else if (errorType === "fetch-error") {
    errorMessage = "There was a problem retrieving the assessment data from the server. Please try again later.";
  } else if (errorType === "missing-skills") {
    errorMessage = "The assessment data is missing required skill information. Please try completing the assessment again.";
  } else if (errorType === "missing-categories") {
    errorMessage = "No assessment categories were found. Please try completing the assessment again.";
  } else if (errorType === "loading") {
    errorTitle = "Loading assessment results";
    errorMessage = "Please wait while we load your assessment results...";
  }

  const [showDebug, setShowDebug] = React.useState(false);

  return (
    <div className="p-6 text-center border border-red-200 rounded-lg bg-red-50 max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-red-500 mb-4">{errorTitle}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {errorMessage}
      </p>
      
      {/* Add debug button and data display */}
      {debugData && (
        <div className="mb-4">
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-slate-700 flex items-center mx-auto mb-2"
          >
            <Info className="h-3 w-3 mr-1" />
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
          
          {showDebug && (
            <div className="mt-2 text-left bg-slate-100 p-3 rounded overflow-auto max-h-40 text-xs">
              <pre className="whitespace-pre-wrap break-words">
                {typeof debugData === 'object' 
                  ? JSON.stringify(debugData, null, 2) 
                  : String(debugData)}
              </pre>
            </div>
          )}
        </div>
      )}
      
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
