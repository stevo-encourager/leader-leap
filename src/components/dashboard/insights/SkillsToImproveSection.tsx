
import React from 'react';
import { SkillWithMetadata } from '@/utils/assessmentCalculations';
import InsightSection from './InsightSection';

interface SkillsToImproveSectionProps {
  skills: SkillWithMetadata[];
  isOpen: boolean;
  onToggle: () => void;
  formatNumber: (num: number | string) => string;
}

const SkillsToImproveSection: React.FC<SkillsToImproveSectionProps> = ({
  skills,
  isOpen,
  onToggle,
  formatNumber
}) => {
  return (
    <InsightSection
      title="Top 3 Individual Skills You Want to Improve"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {skills && skills.length > 0 ? (
        skills.map((skill) => (
          <div key={`improve-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-sm text-slate-500">Related Competency: {skill.categoryTitle}</p>
              </div>
              <div className="bg-amber-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                Desired: {formatNumber(skill.ratings.desired)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-secondary/10 p-3 rounded-lg">
          <p className="text-sm text-slate-500">
            Complete an assessment to identify skills you want to improve.
          </p>
        </div>
      )}
    </InsightSection>
  );
};

export default SkillsToImproveSection;
