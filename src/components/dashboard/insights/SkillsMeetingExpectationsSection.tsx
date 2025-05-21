
import React from 'react';
import { SkillWithMetadata } from '@/utils/assessmentCalculations';
import InsightSection from './InsightSection';

interface SkillsMeetingExpectationsSectionProps {
  skills: SkillWithMetadata[];
  isOpen: boolean;
  onToggle: () => void;
  formatNumber: (num: number | string) => string;
}

const SkillsMeetingExpectationsSection: React.FC<SkillsMeetingExpectationsSectionProps> = ({
  skills,
  isOpen,
  onToggle,
  formatNumber
}) => {
  return (
    <InsightSection
      title="Top 3 Individual Skills Meeting Your Expectations"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {skills && skills.length > 0 ? (
        skills.map((skill) => (
          <div key={`meeting-${skill.id}`} className="bg-secondary/10 p-3 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-sm text-slate-500">Related Competency: {skill.categoryTitle}</p>
              </div>
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                Current: {formatNumber(skill.ratings.current)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-secondary/10 p-3 rounded-lg">
          <p className="text-sm text-slate-500">
            Complete an assessment to identify skills meeting your expectations.
          </p>
        </div>
      )}
    </InsightSection>
  );
};

export default SkillsMeetingExpectationsSection;
