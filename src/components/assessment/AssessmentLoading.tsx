
import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

const loadingMessages = [
  "Loading assessment data...",
  "Preparing your results...",
  "Analyzing your responses...",
  "Almost there..."
];

const AssessmentLoading: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center fade-in">
      <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-100">
        <Loader className="text-encourager animate-spin mx-auto" size={32} />
        <p className="mt-4 text-slate-700 font-medium">{loadingMessages[messageIndex]}</p>
        <div className="mt-2 text-xs text-slate-400">
          <div className="animate-pulse">Please wait while we process your assessment</div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentLoading;
