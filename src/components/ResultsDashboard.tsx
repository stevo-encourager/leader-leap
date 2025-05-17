
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Category, Demographics } from '../utils/assessmentData';
import SkillGapChart from './SkillGapChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsDashboardProps {
  categories: Category[];
  demographics?: Demographics;
  onRestart: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ categories, demographics, onRestart }) => {
  // Calculate overall skill gap average
  const overallGapAverage = categories.reduce((total, category) => {
    const categoryGap = category.skills.reduce((skillTotal, skill) => 
      skillTotal + (skill.desiredLevel - skill.currentLevel), 0) / category.skills.length;
    return total + categoryGap;
  }, 0) / categories.length;

  // Format demographics for display
  const getDemographicValue = (key: string): string => {
    if (!demographics) return 'Not provided';
    return demographics[key as keyof Demographics] as string || 'Not provided';
  };

  // Prepare data for category gap chart
  const categoryGapData = categories.map(category => {
    const avgGap = category.skills.reduce((total, skill) => 
      total + (skill.desiredLevel - skill.currentLevel), 0) / category.skills.length;
    
    return {
      name: category.name,
      gap: parseFloat(avgGap.toFixed(1)),
      fill: `hsl(${200 + (avgGap * 20)}, 70%, 50%)`,
    };
  });

  // Create pie chart data for gap distribution
  const gapDistribution = [0, 0, 0, 0, 0]; // Counts for gaps of size 0, 1, 2, 3, 4
  
  categories.forEach(category => {
    category.skills.forEach(skill => {
      const gap = skill.desiredLevel - skill.currentLevel;
      if (gap >= 0 && gap <= 4) {
        gapDistribution[gap]++;
      }
    });
  });
  
  const gapDistributionData = [
    { name: 'No Gap', value: gapDistribution[0], color: '#10B981' },
    { name: 'Small Gap', value: gapDistribution[1], color: '#3B82F6' },
    { name: 'Moderate', value: gapDistribution[2], color: '#F59E0B' },
    { name: 'Significant', value: gapDistribution[3], color: '#EF4444' },
    { name: 'Critical', value: gapDistribution[4], color: '#7F1D1D' }
  ].filter(item => item.value > 0);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7F1D1D'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Results</CardTitle>
          <CardDescription>
            Based on your self-assessment, here's an analysis of your leadership skill gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-md">
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium">{getDemographicValue('role')}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-md">
                <p className="text-sm text-slate-500">Years of Experience</p>
                <p className="font-medium">{getDemographicValue('yearsExperience')}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-md">
                <p className="text-sm text-slate-500">Industry</p>
                <p className="font-medium">{getDemographicValue('industry')}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Overall Leadership Gap Score</h3>
            <div className="flex items-center justify-center">
              <div className="text-4xl font-bold text-primary">
                {overallGapAverage.toFixed(1)}
                <span className="text-base font-normal text-slate-500 ml-1">/ 4.0</span>
              </div>
            </div>
            <p className="text-center mt-2 text-slate-600">
              {overallGapAverage < 1 ? 'Excellent alignment between current and desired skills!' : 
               overallGapAverage < 2 ? 'Good foundation with some areas for improvement.' :
               overallGapAverage < 3 ? 'Several significant skill gaps to address.' :
               'Critical skill gaps requiring immediate attention.'}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Skill Gap by Category</h3>
            <div className="h-64">
              <SkillGapChart categories={categories} />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Skill Gap Distribution</h3>
            <div className="h-72 flex items-center justify-center">
              {gapDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gapDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {gapDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} skills`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500">No skill gaps to display</div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onRestart} variant="outline">Take Assessment Again</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
