
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
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#2F564D', fontSize: 12, fontWeight: 500 }}
          />
          <Radar
            name="Current Skills"
            dataKey="current"
            stroke="#2F564D"
            fill="#2F564D"
            fillOpacity={0.4}
          />
          <Radar
            name="Desired Skills"
            dataKey="desired"
            stroke="#D4AF37"
            fill="#D4AF37"
            fillOpacity={0.4}
          />
          <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#e5e7eb' }} />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ 
              paddingTop: 20,
              fontSize: '14px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
