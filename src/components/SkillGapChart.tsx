
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
    <div className="radar-chart-container h-[550px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius={150} 
          data={chartData}
        >
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject"
            tickLine={false}
            tick={props => {
              const { payload, x, y } = props;
              const categoryName = payload.value;
              
              // Make the category name more readable if it's too long
              const displayName = categoryName.length > 15 
                ? categoryName.substring(0, 12) + '...' 
                : categoryName;
              
              // Calculate text anchor position based on angle
              const isSideLabel = Math.abs(x - 300) < 30; // Close to center horizontal line
              const textAnchor = x < 300 ? "end" : (x > 300 ? "start" : "middle");
              
              return (
                <g>
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    fill="#2F564D"
                    fontSize={12}
                    fontWeight={500}
                    dy={3}
                  >
                    {displayName}
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
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderColor: '#e5e7eb',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }} 
            formatter={(value, name) => {
              // Check if value is a number before calling toFixed
              return [typeof value === 'number' ? value.toFixed(1) : value, name];
            }}
          />
          <Legend 
            iconType="circle" 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ 
              paddingTop: 20,
              fontSize: '14px',
              fontWeight: 500
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
