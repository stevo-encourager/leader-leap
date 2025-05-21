
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar
} from 'recharts';
import { Category } from '@/utils/assessmentTypes';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

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
  // Add console logs to debug the incoming data
  console.log("SkillGapChart - received categories:", categories);
  
  // Memoize chart data processing for performance
  const chartData = useMemo(() => {
    if (!categories?.length) {
      console.log("SkillGapChart - No categories data available");
      return [];
    }
    
    const processedData = categories
      .filter(category => category?.title && Array.isArray(category.skills) && category.skills.length > 0)
      .map(category => {
        // Get valid skills with defined ratings
        const validSkills = category.skills.filter(
          skill => skill && typeof skill.ratings?.current === 'number' && typeof skill.ratings?.desired === 'number'
        );
        
        console.log(`SkillGapChart - Processing category ${category.title}, valid skills:`, validSkills.length);
        
        if (!validSkills.length) {
          return {
            subject: category.title || 'Unknown',
            current: 0,
            desired: 0,
            fullMark: 10
          };
        }
        
        // Calculate averages more efficiently
        const totalCurrent = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
        const totalDesired = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);
        
        return {
          subject: category.title,
          current: parseFloat((totalCurrent / validSkills.length).toFixed(1)),
          desired: parseFloat((totalDesired / validSkills.length).toFixed(1)),
          fullMark: 10
        };
      });
      
    console.log("SkillGapChart - Processed chart data:", processedData);
    return processedData;
  }, [categories]);

  // Create a placeholder if no data is available
  if (!chartData.length) {
    console.log("SkillGapChart - No chart data available, showing placeholder");
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center">
          No assessment data available for visualization
        </p>
      </div>
    );
  }

  const chartConfig = {
    current: { 
      label: "Current Level",
      theme: { light: '#2F564D', dark: '#3a6a5f' }
    },
    desired: { 
      label: "Desired Level",
      theme: { light: '#8baca5', dark: '#a3c6bf' }
    }
  };

  console.log("SkillGapChart - Rendering chart with data:", chartData);

  return (
    <ChartContainer className="w-full h-full" config={chartConfig}>
      <RadarChart 
        data={chartData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        style={{overflow: 'visible'}}
      >
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: 'currentColor', 
            fontSize: 12,
            fontWeight: 500
          }}
        />
        <Radar
          name="current"
          dataKey="current"
          stroke="var(--color-current, #2F564D)"
          fill="var(--color-current, #2F564D)"
          fillOpacity={0.6}
        />
        <Radar
          name="desired"
          dataKey="desired"
          stroke="var(--color-desired, #8baca5)"
          fill="var(--color-desired, #8baca5)"
          fillOpacity={0.6}
        />
        <ChartTooltip 
          content={<ChartTooltipContent />} 
        />
        <ChartLegend 
          content={<ChartLegendContent />} 
          verticalAlign="bottom" 
        />
      </RadarChart>
    </ChartContainer>
  );
};

export default React.memo(SkillGapChart);
