
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
  // Memoize chart data processing for performance
  const chartData = useMemo(() => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    return categories.map(category => {
      // Default values
      let avgCurrent = 0;
      let avgDesired = 0;
      let skillCount = 0;
      
      // Process skills if they exist
      if (category.skills && Array.isArray(category.skills) && category.skills.length > 0) {
        // Count valid skills and sum ratings
        for (const skill of category.skills) {
          if (!skill.ratings) continue;
          
          const current = Number(skill.ratings.current);
          const desired = Number(skill.ratings.desired);
          
          if (current > 0 || desired > 0) {
            avgCurrent += current;
            avgDesired += desired;
            skillCount++;
          }
        }
        
        // Calculate averages
        if (skillCount > 0) {
          avgCurrent = parseFloat((avgCurrent / skillCount).toFixed(1));
          avgDesired = parseFloat((avgDesired / skillCount).toFixed(1));
        }
      }
      
      return {
        subject: category.title || "Unknown Category",
        current: avgCurrent,
        desired: avgDesired,
        fullMark: 10
      };
    });
  }, [categories]);

  // Create a placeholder if no data is available
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center">
          No assessment data available for visualization
        </p>
      </div>
    );
  }
  
  // Filter to only show categories with actual data
  const validChartData = chartData.filter(
    item => item.current > 0 || item.desired > 0
  );
  
  if (validChartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center">
          Complete the assessment to see your competency radar chart
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

  return (
    <ChartContainer className="w-full h-full" config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={validChartData} 
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
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default React.memo(SkillGapChart);
