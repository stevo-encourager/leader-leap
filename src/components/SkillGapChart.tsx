
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

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
    // If no categories, return early
    if (!categories || categories.length === 0) {
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
    
    setChartData(preparedData);
  }, [categories]);

  if (chartData.length === 0) {
    return <div className="text-center p-6">No data available for chart</div>;
  }

  const chartConfig = {
    current: {
      label: "Current Level",
      theme: {
        light: "#2F564D",
        dark: "#2F564D",
      },
    },
    desired: {
      label: "Desired Level",
      theme: {
        light: "#8baca5",
        dark: "#8baca5",
      },
    },
  };

  return (
    <ChartContainer className="w-full h-[400px]" config={chartConfig}>
      <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <PolarGrid gridType="circle" />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: 'currentColor', 
            fontSize: 12
          }}
        />
        <Radar
          dataKey="current"
          name="Current Level"
          stroke="var(--color-current)"
          fill="var(--color-current)"
          fillOpacity={0.6}
        />
        <Radar
          dataKey="desired"
          name="Desired Level"
          stroke="var(--color-desired)"
          fill="var(--color-desired)"
          fillOpacity={0.6}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                return (
                  <div className="flex items-center gap-2">
                    <span>{parseFloat(value as string).toFixed(2)}</span>
                  </div>
                );
              }}
            />
          }
        />
        <Legend iconType="circle" />
      </RadarChart>
    </ChartContainer>
  );
};

export default SkillGapChart;
