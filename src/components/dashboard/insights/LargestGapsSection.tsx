
import React from 'react';
import { CategoryWithMetadata } from '@/utils/assessmentCalculations';
import InsightSection from './InsightSection';
import InsightSummary from './InsightSummary';

interface LargestGapsSectionProps {
  categoryGaps: CategoryWithMetadata[];
  isOpen: boolean;
  onToggle: () => void;
  formatNumber: (num: number | string) => string;
  averageGap: string | number;
}

const LargestGapsSection: React.FC<LargestGapsSectionProps> = ({
  categoryGaps,
  isOpen,
  onToggle,
  formatNumber,
  averageGap
}) => {
  return (
    <InsightSection
      title="Your 2 Largest Competency Gaps"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <InsightSummary averageGap={averageGap} />
      
      {categoryGaps && categoryGaps.length > 0 && categoryGaps.some(category => category.gap > 0) ? (
        categoryGaps.map((category) => (
          <div key={`largest-gap-${category.id}`} className="bg-secondary/10 p-3 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{category.title}</p>
                <p className="text-sm text-slate-500">{category.description}</p>
              </div>
              <div className="bg-red-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                Gap: {formatNumber(category.gap)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-secondary/10 p-3 rounded-lg">
          <p className="text-sm text-slate-500">
            You need to complete an assessment with different current and desired values to identify competency gaps.
          </p>
        </div>
      )}
    </InsightSection>
  );
};

export default LargestGapsSection;
