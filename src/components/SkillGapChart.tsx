
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
    console.log("Categories received in SkillGapChart:", categories);
    
    // If no categories, return early
    if (!categories || categories.length === 0) {
      console.log("No categories to display in chart");
      return;
    }

    // Process the data for the chart
    const preparedData: ChartData[] = categories
      .filter(category => category.skills && category.skills.length > 0)
      .map(category => {
        // Calculate average for each category
        const totalSkills = category.skills.length;
        let sumCurrent = 0;
        let sumDesired = 0;
        
        category.skills.forEach(skill => {
          if (skill.ratings) {
            sumCurrent += skill.ratings.current || 0;
            sumDesired += skill.ratings.desired || 0;
          }
        });
        
        const categoryAvgCurrent = totalSkills > 0 ? sumCurrent / totalSkills : 0;
        const categoryAvgDesired = totalSkills > 0 ? sumDesired / totalSkills : 0;
        
        return {
          subject: category.title,
          current: parseFloat(categoryAvgCurrent.toFixed(2)),
          desired: parseFloat(categoryAvgDesired.toFixed(2)),
          fullMark: 10
        };
      });
    
    console.log("Prepared chart data:", preparedData);
    setChartData(preparedData);
  }, [categories]);

  if (chartData.length === 0) {
    return <div className="text-center p-6">No data available for chart</div>;
  }

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
