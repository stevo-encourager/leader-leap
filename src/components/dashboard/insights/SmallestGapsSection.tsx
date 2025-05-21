
import React from 'react';
import { CategoryWithMetadata } from '@/utils/assessmentCalculations';
import InsightSection from './InsightSection';

interface SmallestGapsSectionProps {
  categoryGaps: CategoryWithMetadata[];
  isOpen: boolean;
  onToggle: () => void;
  formatNumber: (num: number | string) => string;
}

const SmallestGapsSection: React.FC<SmallestGapsSectionProps> = ({
  categoryGaps,
  isOpen,
  onToggle,
  formatNumber
}) => {
  return (
    <InsightSection
      title="Your Top 3 Smallest Competency Gaps"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {categoryGaps && categoryGaps.length > 0 ? (
        categoryGaps.map((category) => (
          <div key={`small-gap-${category.id}`} className="bg-secondary/10 p-3 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{category.title}</p>
                <p className="text-sm text-slate-500">{category.description}</p>
              </div>
              <div className="bg-green-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                Gap: {formatNumber(category.gap)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-secondary/10 p-3 rounded-lg">
          <p className="text-sm text-slate-500">
            Complete an assessment to identify your smallest competency gaps.
          </p>
        </div>
      )}
    </InsightSection>
  );
};

export default SmallestGapsSection;
