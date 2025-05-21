
import React from 'react';
import { CircleGauge } from 'lucide-react';

const AssessmentLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
        <p className="mt-2 text-slate-500">Loading assessment data...</p>
      </div>
    </div>
  );
};

export default AssessmentLoading;
