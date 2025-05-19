
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
            tickLine={false}
            // Adding this property ensures labels are positioned at the center of each segment
            tick={(props) => {
              const { x, y, payload, textAnchor, ...rest } = props;
              // Find the angle for this category (0 to 360 degrees)
              const angleIndex = chartData.findIndex(item => item.subject === payload.value);
              const totalCategories = chartData.length;
              const angle = (angleIndex / totalCategories) * 360;
              
              // Adjust position to center the label in each segment
              // This offsets the label position to be midway between grid lines
              const adjustedAngle = angle + (360 / (totalCategories * 2));
              
              // Convert angle to radians and calculate the adjusted position
              const angleRad = (adjustedAngle * Math.PI) / 180;
              const radius = 170; // Slightly larger than chart radius for labels
              const newX = Math.cos(angleRad) * radius;
              const newY = Math.sin(angleRad) * radius;
              
              return (
                <g transform={`translate(${newX},${newY})`}>
                  <text 
                    {...rest}
                    textAnchor={textAnchor} 
                    fill="#2F564D" 
                    fontSize={12} 
                    fontWeight={500}
                    dy={3}
                  >
                    {payload.value}
                  </text>
                </g>
              );
            }}
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
            stroke="#8baca5"
            fill="#8baca5"
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
