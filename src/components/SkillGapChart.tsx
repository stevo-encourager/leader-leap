
import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  Legend, 
  Tooltip,
  TooltipProps
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

  // Prepare chart data from categories
  useEffect(() => {
    if (!categories || categories.length === 0) {
      console.log("No categories provided to SkillGapChart");
      return;
    }
    
    const preparedData: ChartData[] = [];
    
    categories.forEach(category => {
      if (!category.skills || category.skills.length === 0) {
        console.log(`Category ${category.title} has no skills`);
        return;
      }
      
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
      
      preparedData.push({
        subject: category.title,
        current: parseFloat(categoryAvgCurrent.toFixed(2)),
        desired: parseFloat(categoryAvgDesired.toFixed(2)),
        fullMark: 10
      });
    });
    
    console.log("Chart data prepared:", preparedData);
    setChartData(preparedData);
  }, [categories]);

  if (chartData.length === 0) {
    return <div className="text-center p-6">No data available for chart</div>;
  }

  // Create a simple custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const subject = payload[0]?.payload?.subject || '';
      const current = parseFloat((payload[0]?.value || 0).toString());
      const desired = parseFloat((payload[1]?.value || 0).toString());
      const gap = parseFloat((Math.abs(desired - current)).toFixed(2));
      
      return (
        <div className="bg-white p-3 rounded shadow-md border border-gray-200">
          <p className="font-medium">{subject}</p>
          <p className="text-sm text-gray-700">
            Current: <span className="font-medium">{current.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Desired: <span className="font-medium">{desired.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Gap: <span className="font-medium">{gap.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart 
          outerRadius={180} 
          data={chartData}
        >
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: '#2F564D', 
              fontSize: 12
            }}
          />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="#2F564D"
            fill="#2F564D"
            fillOpacity={0.4}
          />
          <Radar
            name="Desired Level"
            dataKey="desired"
            stroke="#8baca5"
            fill="#8baca5"
            fillOpacity={0.4}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillGapChart;
