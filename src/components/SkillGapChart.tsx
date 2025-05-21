
import React, { useEffect, useState } from 'react';
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
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    console.log("SkillGapChart - Categories received:", categories);
    
    // Process the data for the chart
    const preparedData: ChartData[] = categories
      .filter(category => category && category.title && Array.isArray(category.skills))
      .map(category => {
        // Calculate average for each category
        const skills = category.skills.filter(skill => skill && skill.ratings);
        const validSkillCount = skills.length;
        
        if (validSkillCount === 0) {
          return {
            subject: category.title,
            current: 0,
            desired: 0,
            fullMark: 10
          };
        }
        
        const sumCurrent = skills.reduce((sum, skill) => {
          const currentRating = typeof skill.ratings.current === 'number' 
            ? skill.ratings.current 
            : parseFloat(String(skill.ratings.current || '0'));
          return sum + (isNaN(currentRating) ? 0 : currentRating);
        }, 0);
        
        const sumDesired = skills.reduce((sum, skill) => {
          const desiredRating = typeof skill.ratings.desired === 'number' 
            ? skill.ratings.desired 
            : parseFloat(String(skill.ratings.desired || '0'));
          return sum + (isNaN(desiredRating) ? 0 : desiredRating);
        }, 0);
        
        const categoryAvgCurrent = validSkillCount > 0 ? sumCurrent / validSkillCount : 0;
        const categoryAvgDesired = validSkillCount > 0 ? sumDesired / validSkillCount : 0;
        
        return {
          subject: category.title,
          current: parseFloat(categoryAvgCurrent.toFixed(2)),
          desired: parseFloat(categoryAvgDesired.toFixed(2)),
          fullMark: 10
        };
      });
    
    console.log("SkillGapChart - Prepared chart data:", preparedData);
    setChartData(preparedData);
  }, [categories]);

  // Create a placeholder if no data is available
  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No assessment data available</p>
      </div>
    );
  }

  // Always display the chart even if all values are zero
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <PolarGrid />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: '#333', 
            fontSize: 12
          }}
        />
        <Radar
          name="Current Level"
          dataKey="current"
          stroke="#2F564D"
          fill="#2F564D"
          fillOpacity={0.6}
        />
        <Radar
          name="Desired Level"
          dataKey="desired"
          stroke="#8baca5"
          fill="#8baca5"
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillGapChart;
