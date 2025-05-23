
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ValidationErrorDisplayProps {
  error: string | null;
  onBack: () => void;
}

const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({ error, onBack }) => {
  if (!error) return null;
  
  return (
    <div className="fade-in">
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          <h3 className="font-bold">Data Validation Error</h3>
        </div>
        <p className="mt-2">{error}</p>
        <p className="mt-2 text-sm">Please return to the home page and try starting the assessment again.</p>
        <Button onClick={onBack} variant="destructive" className="mt-4">
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default ValidationErrorDisplay;
