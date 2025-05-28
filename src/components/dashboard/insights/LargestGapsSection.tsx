
import React from 'react';
import { InsightData } from '@/utils/assessmentCalculations/types';

interface LargestGapsSectionProps {
  insights: InsightData;
}

const LargestGapsSection: React.FC<LargestGapsSectionProps> = ({ insights }) => {
  if (!insights.largestGaps || insights.largestGaps.length === 0) {
    return null;
  }

  return (
    <div className="insight-card page-break-avoid bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-xl font-semibold text-encourager mb-4 pb-2 border-b border-slate-200">
        Top Three Priority Development Areas
      </h3>
      <div className="space-y-4">
        {insights.largestGaps.slice(0, 3).map((gap, index) => (
          <div key={gap.id} className="flex items-center p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0 w-8 h-8 bg-encourager text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-medium text-slate-900">
                  {gap.name}
                </h4>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Gap: {gap.gap.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Focus Area:</strong> These competencies show the largest gaps between your current and desired skill levels. 
          Prioritizing development in these areas will have the most significant impact on your leadership effectiveness.
        </p>
      </div>
    </div>
  );
};

export default LargestGapsSection;
