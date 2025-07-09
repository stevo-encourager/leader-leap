
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const { currentAvg, desiredAvg } = calculateAverages(category);
          
          return (
            <Card key={category.id} className="border border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-encourager">
                  {category.title}
                </CardTitle>
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>Current Level: {currentAvg}</span>
                  <span>Desired Level: {desiredAvg}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.skills && category.skills.map((skill) => (
                    <div key={skill.id} className="border-l-2 border-slate-200 pl-3">
                      <div className="font-medium text-sm text-slate-800 mb-1">
                        {skill.name}
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Current: {skill.ratings?.current || 0}</span>
                        <span>Desired: {skill.ratings?.desired || 0}</span>
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
