
import React from 'react';
import ResultsDashboard from '../ResultsDashboard';
import { Button } from '@/components/ui/button';
import { Category, Demographics } from '../../utils/assessmentData';

interface ResultsDisplayProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
  onSignup: () => void;
  isAuthenticated: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  categories,
  demographics,
  onRestart,
  onBack,
  onSignup,
  isAuthenticated
}) => {
  return (
    <>
      <ResultsDashboard 
        categories={categories}
        demographics={demographics}
        onRestart={onRestart}
        onBack={onBack}
        onSignup={onSignup}
      />
      
      {!isAuthenticated && (
        <div className="mt-6 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
          <p className="text-slate-700 mb-4">
            <strong>Want to save your results, download as PDF, and access them later?</strong><br />
            Create an account to unlock all features of the Leadership Assessment Tool.
          </p>
          <Button 
            variant="encourager" 
            onClick={onSignup}
          >
            Create an Account
          </Button>
        </div>
      )}
    </>
  );
};

export default ResultsDisplay;
