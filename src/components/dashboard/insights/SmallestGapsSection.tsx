
import React from 'react';
import { InsightData } from '@/utils/assessmentCalculations/types';

interface SmallestGapsSectionProps {
  insights: InsightData;
}

const SmallestGapsSection: React.FC<SmallestGapsSectionProps> = ({ insights }) => {
  if (!insights.smallestGaps || insights.smallestGaps.length === 0) {
    return null;
  }

  return (
    <div className="insight-card page-break-avoid bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-xl font-semibold text-encourager mb-2 pb-2 border-b border-slate-200">
        Key Competencies to Leverage
      </h3>
      <div className="space-y-3 mt-3">
        {insights.smallestGaps.slice(0, 5).map((gap) => (
          <div key={gap.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">
                {gap.name}
              </h4>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Gap: {gap.gap.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>Strength Areas:</strong> These competencies represent your strongest areas where you're already close to your desired skill level. 
          Consider leveraging these strengths to mentor others or take on leadership roles in these areas.
        </p>
      </div>
    </div>
  );
};

export default SmallestGapsSection;
