
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
  console.log("CHART - SkillGapChart received categories:", categories);
  console.log("CHART - Categories is array:", Array.isArray(categories));
  console.log("CHART - Categories length:", categories?.length || 0);
  
  // Log first category and skills for detailed debugging
  if (categories && categories.length > 0) {
    console.log("CHART - First category:", categories[0].title);
    if (categories[0].skills && categories[0].skills.length > 0) {
      console.log("CHART - First skill sample:", categories[0].skills[0]);
    }
  }
  
  // Memoize chart data processing for performance
  const chartData = useMemo(() => {
    console.log("CHART - Processing chart data from categories");
    
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error("CHART - No valid categories data available");
      return [];
    }
    
    // Filter out any invalid category objects before mapping
    const validCategories = categories.filter(cat => 
      cat && typeof cat === 'object' && cat.title && 
      cat.skills && Array.isArray(cat.skills)
    );
    
    console.log("CHART - Valid categories for chart:", validCategories.length);
    
    if (validCategories.length === 0) {
      console.error("CHART - No valid categories after filtering");
      return [];
    }
    
    const data = validCategories.map(category => {
      // Get the category title or use a fallback
      const title = category.title || "Unknown Category";
      console.log(`CHART - Processing category: ${title} with ${category.skills?.length || 0} skills`);
      
      // Validate skills array
      const skills = category.skills?.filter(skill => 
        skill && skill.ratings && 
        (typeof skill.ratings.current === 'number' || typeof skill.ratings.desired === 'number')
      ) || [];
      
      console.log(`CHART - Category ${title} has ${skills.length} valid skills`);
      
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
      let skillCount = 0;
      
      skills.forEach(skill => {
        const current = typeof skill.ratings.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0;
        
        // Only include skills with valid ratings
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          skillCount++;
          console.log(`CHART - Skill ${skill.name}: Current=${current}, Desired=${desired}`);
        }
      });
      
      if (skillCount === 0) {
        console.log(`CHART - No valid skills with ratings in category: ${title}`);
        return {
          subject: title,
          current: 0,
          desired: 0,
          fullMark: 10
        };
      }
      
      const avgCurrent = parseFloat((totalCurrent / skillCount).toFixed(1));
      const avgDesired = parseFloat((totalDesired / skillCount).toFixed(1));
      
      console.log(`CHART - Category ${title}: current=${avgCurrent}, desired=${avgDesired}, gap=${Math.abs(avgDesired - avgCurrent).toFixed(1)}`);
      
      return {
        subject: title,
        current: avgCurrent,
        desired: avgDesired,
        fullMark: 10
      };
    });
    
    console.log("CHART - Final processed chart data:", data);
    return data;
  }, [categories]);

  // Create a placeholder if no data is available
  if (!chartData || chartData.length === 0) {
    console.error("CHART - No chart data available after processing");
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
