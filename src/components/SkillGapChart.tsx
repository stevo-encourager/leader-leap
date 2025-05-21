
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
  console.log("SkillGapChart - received categories:", categories);
  console.log("SkillGapChart - Categories is array:", Array.isArray(categories));
  console.log("SkillGapChart - Categories length:", categories?.length || 0);
  
  // Memoize chart data processing for performance and prevent errors
  const chartData = useMemo(() => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error("SkillGapChart - No valid categories data available");
      return [];
    }
    
    // Filter out any invalid category objects before mapping
    const validCategories = categories.filter(cat => 
      cat && typeof cat === 'object' && cat.title && 
      cat.skills && Array.isArray(cat.skills)
    );
    
    console.log("SkillGapChart - Valid categories count:", validCategories.length);
    
    if (validCategories.length === 0) {
      console.error("SkillGapChart - No valid categories after filtering");
      return [];
    }
    
    return validCategories.map(category => {
      // Get the category title or use a fallback
      const title = category.title || "Unknown Category";
      console.log(`SkillGapChart - Processing category: ${title}`);
      
      // Validate skills array
      const skills = category.skills?.filter(skill => 
        skill && skill.ratings && 
        typeof skill.ratings.current === 'number' && 
        typeof skill.ratings.desired === 'number'
      ) || [];
      
      console.log(`SkillGapChart - Category ${title} has ${skills.length} valid skills`);
      
      if (skills.length === 0) {
        return {
          subject: title,
          current: 0,
          desired: 0,
          fullMark: 10
        };
      }
      
      // Calculate averages safely
      let totalCurrent = 0;
      let totalDesired = 0;
      
      skills.forEach(skill => {
        totalCurrent += Number(skill.ratings.current) || 0;
        totalDesired += Number(skill.ratings.desired) || 0;
      });
      
      const avgCurrent = parseFloat((totalCurrent / skills.length).toFixed(1));
      const avgDesired = parseFloat((totalDesired / skills.length).toFixed(1));
      
      console.log(`SkillGapChart - Category ${title}: current=${avgCurrent}, desired=${avgDesired}`);
      
      return {
        subject: title,
        current: avgCurrent,
        desired: avgDesired,
        fullMark: 10
      };
    });
  }, [categories]);

  console.log("SkillGapChart - Final chart data:", chartData);

  // Create a placeholder if no data is available
  if (!chartData || chartData.length === 0) {
    console.error("SkillGapChart - No chart data available after processing");
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

  return (
    <ChartContainer className="w-full h-full" config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
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
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default React.memo(SkillGapChart);
