
import React from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Legend, 
  Tooltip
} from 'recharts';
import { Category, Skill } from '@/utils/assessmentData';

interface SkillGapChartProps {
  categories: Category[];
}

interface ChartData {
  subject: string;
  current: number;
  desired: number;
  fullMark: number;
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories }) => {
  // Prepare chart data from categories
  const prepareChartData = (): ChartData[] => {
    const allSkills: ChartData[] = [];
    
    categories.forEach(category => {
      // Calculate average for each category
      const categoryAvgCurrent = category.skills.reduce((sum, skill) => sum + skill.ratings.current, 0) / category.skills.length;
      const categoryAvgDesired = category.skills.reduce((sum, skill) => sum + skill.ratings.desired, 0) / category.skills.length;
      
      allSkills.push({
        subject: category.title,
        current: categoryAvgCurrent,
        desired: categoryAvgDesired,
        fullMark: 10
      });
    });
    
    return allSkills;
  };

  const chartData = prepareChartData();

  return (
    <div className="radar-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={150} data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar
            name="Current Skills"
            dataKey="current"
            stroke="#1A365D"
            fill="#1A365D"
            fillOpacity={0.4}
          />
          <Radar
            name="Desired Skills"
            dataKey="desired"
            stroke="#2C7A7B"
            fill="#2C7A7B"
            fillOpacity={0.4}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
