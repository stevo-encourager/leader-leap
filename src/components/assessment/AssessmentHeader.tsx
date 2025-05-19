
import React from 'react';
import { CircleGauge } from 'lucide-react';

const AssessmentHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-white flex items-center gap-2 bg-encourager px-4 py-2 rounded-md">
        <CircleGauge className="text-white" size={28} strokeWidth={1.5} />
        Leadership Assessment Tool
      </h1>
      <img 
        src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
        alt="Company Logo" 
        className="h-24" 
      />
    </div>
  );
};

export default AssessmentHeader;
