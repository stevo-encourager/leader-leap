
import React from 'react';
import { Category } from '@/utils/assessmentTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillsAssessmentProps {
  categories: Category[];
}

const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({ categories }) => {
  // Calculate averages for a competency
  const calculateAverages = (category: Category) => {
    if (!category.skills || category.skills.length === 0) {
      return { currentAvg: 0, desiredAvg: 0 };
    }

    const validSkills = category.skills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    );

    if (validSkills.length === 0) {
      return { currentAvg: 0, desiredAvg: 0 };
    }

    const currentSum = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
    const desiredSum = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);

    return {
      currentAvg: Math.round((currentSum / validSkills.length) * 10) / 10,
      desiredAvg: Math.round((desiredSum / validSkills.length) * 10) / 10
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Your self-assessment scores across all skills.
        </p>
      </div>
      
      <div className="space-y-4">
        {categories.map((category) => {
          const { currentAvg, desiredAvg } = calculateAverages(category);
          
          return (
            <Card key={category.id} className="border border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900 mb-2">
                      {category.title}
                    </CardTitle>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex gap-6 ml-4">
                    <span className="font-bold text-sm text-slate-900">Current: {currentAvg}</span>
                    <span className="font-bold text-sm text-slate-900">Desired: {desiredAvg}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {category.skills && category.skills.map((skill) => (
                    <div key={skill.id} className="border-l-2 border-slate-200 pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="font-bold text-sm text-slate-900 mb-1">
                            {skill.name}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {skill.description}
                          </p>
                        </div>
                        <div className="flex gap-6 ml-4">
                          <span className="text-xs text-slate-900">Current: {skill.ratings?.current || 0}</span>
                          <span className="text-xs text-slate-900">Desired: {skill.ratings?.desired || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
