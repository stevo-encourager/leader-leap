
import React from 'react';
import { User } from 'lucide-react';

const EncouragerCoaching: React.FC = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-start gap-3">
        <User className="text-encourager h-5 w-5 mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Consider Coaching</h3>
          
          <div className="bg-white p-3 rounded-md border border-slate-200">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-encourager" />
              Next Steps with a Coach
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              <li>Create awareness about your leadership patterns</li>
              <li>Design experiments to apply strengths to development areas</li>
              <li>Establish accountability for practice and reflection</li>
              <li>Measure progress through regular reassessment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncouragerCoaching;
