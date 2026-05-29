
import React from 'react';
import { ListChecks } from 'lucide-react';
import { Category } from '@/utils/assessmentTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillsAssessmentProps {
  categories: Category[];
}

const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({ categories }) => {
  // Calculate averages and gap for a competency
  const calculateAverages = (category: Category) => {
    if (!category.skills || category.skills.length === 0) {
      return { currentAvg: 0, desiredAvg: 0, gap: 0 };
    }

    const validSkills = category.skills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    );

    if (validSkills.length === 0) {
      return { currentAvg: 0, desiredAvg: 0, gap: 0 };
    }

    const currentSum = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
    const desiredSum = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);

    const currentAvg = Math.round((currentSum / validSkills.length) * 10) / 10;
    const desiredAvg = Math.round((desiredSum / validSkills.length) * 10) / 10;
    const gap = Math.round((desiredAvg - currentAvg) * 10) / 10;

    return { currentAvg, desiredAvg, gap };
  };

  // Sort categories by gap descending
  const categoriesWithGap = categories.map(category => ({
    ...category,
    ...calculateAverages(category)
  }));
  const sortedCategories = categoriesWithGap.sort((a, b) => b.gap - a.gap);

  return (
    <div className="space-y-6 skills-assessment-component" data-component="skills-assessment">
      <div className="mb-4 px-2 pt-2 pb-3 border-b border-slate-200">
        <h3 className="text-xl font-bold font-quicksand flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Your Skills Assessment Overview
        </h3>
        <p className="text-xs text-slate-600 mt-1">Detailed breakdown of your self-assessment scores across all competencies</p>
      </div>
      
      <div className="space-y-4">
        {sortedCategories.map((category, idx) => {
          // const { currentAvg, desiredAvg } = calculateAverages(category); // now included in category
          return (
            <Card
              key={category.id}
              className="border border-slate-200 bg-encourager-background"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold font-quicksand mb-2">
                      {category.title}
                    </CardTitle>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex gap-6 ml-4 items-center">
                    <span className="font-bold text-sm">
                      Current: {category.currentAvg}
                    </span>
                    <span className="font-bold text-sm">
                      Desired: {category.desiredAvg}
                    </span>
                    <span className="font-normal text-sm" style={{ color: '#B91C1C' }}>
                      Gap: {category.gap}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {category.skills && category.skills.map((skill) => {
                    const gap = (typeof skill.ratings?.desired === 'number' && typeof skill.ratings?.current === 'number') ? (Math.round((skill.ratings.desired - skill.ratings.current) * 10) / 10) : '';
                    return (
                      <div key={skill.id} className="border-l-2 border-slate-200 pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="font-normal text-sm text-slate-900 mb-1">
                              {skill.name}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {skill.description}
                            </p>
                          </div>
                          <div className="flex gap-6 ml-4 items-center">
                            <span className="text-xs text-slate-900">Current: {skill.ratings?.current || 0}</span>
                            <span className="text-xs text-slate-900">Desired: {skill.ratings?.desired || 0}</span>
                            <span className="text-xs text-red-700">Gap: {gap}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsAssessment;
