
import React from 'react';
import { User } from 'lucide-react';

const StrengthsBasedApproach: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-start gap-3">
        <User className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Strengths-Based Approach</h3>
          <p className="text-sm text-slate-600 mb-3">
            Strengths and skills are two different things. Strengths are natural behaviors that energize you, 
            while skills are learned capabilities. The most effective leadership development leverages your 
            innate strengths to address gaps in your leadership skillset.
          </p>
          <p className="text-sm text-slate-600">
            By understanding how to apply your natural strengths to develop new skills, you can achieve more 
            sustainable growth and performance. This approach focuses on what you do well rather than solely 
            fixing deficiencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StrengthsBasedApproach;
