
import React from 'react';
import { Loader } from 'lucide-react';

const AssessmentLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="text-encourager animate-spin mx-auto" size={32} />
        <p className="mt-2 text-slate-500">Loading assessment data...</p>
        <p className="text-xs text-slate-400 mt-1">Please wait while we retrieve your results</p>
      </div>
    </div>
  );
};

export default AssessmentLoading;
