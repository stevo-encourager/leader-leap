
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentData';
import SkillGapChart from './SkillGapChart';
import { ArrowLeft } from 'lucide-react';

interface ResultsDashboardProps {
  categories: Category[];
  demographics: Demographics;
  onRestart: () => void;
  onBack: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ categories, demographics, onRestart, onBack }) => {
  // Calculate the average gap for all categories
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0);
  const totalGap = categories.reduce((sum, category) => {
    return sum + category.skills.reduce((catSum, skill) => {
      return catSum + Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0));
    }, 0);
  }, 0);
  
  const averageGap = parseFloat((totalGap / totalSkills).toFixed(2));

  // Find the top 3 skills with the largest gaps
  const allSkills = categories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      categoryTitle: category.title,
      gap: parseFloat(Math.abs((skill.ratings.desired || 0) - (skill.ratings.current || 0)).toFixed(2))
    }))
  );
  
  const topGapSkills = [...allSkills].sort((a, b) => b.gap - a.gap).slice(0, 3);

  return (
    <div className="fade-in space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Leadership Assessment Results</CardTitle>
          <CardDescription>
            Review your leadership skill gaps and development opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Summary */}
          {(demographics.role || demographics.industry || demographics.yearsOfExperience) && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {demographics.role && (
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-medium">{demographics.role}</p>
                  </div>
                )}
                {demographics.industry && (
                  <div>
                    <p className="text-sm text-slate-500">Industry</p>
                    <p className="font-medium">{demographics.industry}</p>
                  </div>
                )}
                {demographics.yearsOfExperience && (
                  <div>
                    <p className="text-sm text-slate-500">Leadership Experience</p>
                    <p className="font-medium">{demographics.yearsOfExperience}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div>
            <h3 className="text-lg font-medium mb-3">Key Insights</h3>
            <div className="bg-primary/5 p-4 rounded-lg mb-4">
              <p className="text-sm">
                Based on your assessment, your average skill gap is <span className="font-bold">{averageGap.toFixed(2)}</span> points.
                This indicates the typical difference between your current abilities and how important these skills are to your role.
              </p>
            </div>
            
            <h4 className="text-md font-medium mb-2">Top Development Opportunities</h4>
            <div className="space-y-3">
              {topGapSkills.map((skill, index) => (
                <div key={skill.id} className="bg-secondary/10 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-slate-500">{skill.categoryTitle}</p>
                    </div>
                    <div className="bg-primary text-white px-2 py-1 rounded-full h-fit text-xs font-medium">
                      Gap: {skill.gap.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gap Chart */}
          <div>
            <h3 className="text-lg font-medium mb-3">Detailed Analysis</h3>
            <div className="bg-white rounded-lg p-3 border w-full">
              <div className="w-full h-[500px]">
                <SkillGapChart categories={categories} />
              </div>
            </div>
          </div>

          {/* Development Recommendations */}
          <div>
            <h3 className="text-lg font-medium mb-2">Recommended Next Steps</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Focus on developing your top gap areas through targeted learning opportunities</li>
              <li>Consider seeking a mentor who excels in your development areas</li>
              <li>Create a 30-day action plan to address your most critical skill gaps</li>
              <li>Re-assess in 3-6 months to measure your progress</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
          <Button onClick={onRestart}>
            Start New Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
