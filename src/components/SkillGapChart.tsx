
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
import { Category } from '@/utils/assessmentTypes';

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
    if (!categories || categories.length === 0) {
      return [];
    }
    
    const allSkills: ChartData[] = [];
    
    categories.forEach(category => {
      if (!category?.skills || category.skills.length === 0) {
        return;
      }
      
      // Calculate average for each category
      const categoryAvgCurrent = category.skills.reduce((sum, skill) => {
        return sum + (skill.ratings?.current || 0);
      }, 0) / category.skills.length;
      
      const categoryAvgDesired = category.skills.reduce((sum, skill) => {
        return sum + (skill.ratings?.desired || 0);
      }, 0) / category.skills.length;
      
      allSkills.push({
        subject: category.title,
        current: parseFloat(categoryAvgCurrent.toFixed(2)),
        desired: parseFloat(categoryAvgDesired.toFixed(2)),
        fullMark: 10
      });
    });
    
    return allSkills;
  };

  const chartData = prepareChartData();

  // Custom formatter for the tooltip to ensure numbers display properly with 2 decimal points
  const tooltipFormatter = (value: string | number) => {
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  // If there's no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">No assessment data available to display.</p>
      </div>
    );
  }

  return (
    <div className="radar-chart-container w-full">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart outerRadius={180} data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: '#2F564D', 
              fontSize: 12, 
              fontWeight: 500,
            }}
            tickLine={false}
            style={{
              fontSize: '12px',
              fontWeight: 500,
            }}
          />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="#2F564D"
            fill="#2F564D"
            fillOpacity={0.4}
            dot={{ stroke: '#2F564D', strokeWidth: 2, fill: '#fff', r: 3 }}
          />
          <Radar
            name="Desired Level"
            dataKey="desired"
            stroke="#8baca5"
            fill="#8baca5"
            fillOpacity={0.4}
            dot={{ stroke: '#8baca5', strokeWidth: 2, fill: '#fff', r: 3 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderColor: '#e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            formatter={tooltipFormatter}
          />
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
