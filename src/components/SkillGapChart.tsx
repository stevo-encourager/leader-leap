
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip,
  Legend
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
  skillCount?: number;
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories }) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Log detailed info about categories
  console.log("SkillGapChart - Categories count:", safeCategories.length);
  if (safeCategories.length > 0) {
    const totalSkills = safeCategories.reduce((total, cat) => total + (cat.skills?.length || 0), 0);
    console.log("SkillGapChart - Total skills:", totalSkills);
    
    // Log first category as sample
    if (safeCategories[0]) {
      const firstCat = safeCategories[0];
      console.log("SkillGapChart - First category:", {
        title: firstCat.title,
        skillsCount: firstCat.skills?.length || 0,
        hasSkills: Array.isArray(firstCat.skills) && firstCat.skills.length > 0,
        firstSkillName: firstCat.skills?.[0]?.name,
        firstSkillRatings: firstCat.skills?.[0]?.ratings
      });
    }
  }
  
  // Process chart data with detailed logging
  const chartData = useMemo(() => {
    console.log("SkillGapChart - Processing chart data from categories");
    
    if (!safeCategories || safeCategories.length === 0) {
      console.warn("SkillGapChart - No categories provided");
      return [];
    }
    
    // Process all categories to chart data
    const result: ChartData[] = [];
    
    for (const category of safeCategories) {
      // Skip invalid categories
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        console.log(`SkillGapChart - Skipping invalid category: ${category?.title || 'unknown'}`);
        continue;
      }
      
      // Default values
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      // Process each skill in the category
      for (const skill of category.skills) {
        // Skip invalid skills
        if (!skill || !skill.ratings) {
          continue;
        }
        
        // Get ratings
        const current = typeof skill.ratings.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0;
        
        // Only include valid, non-zero ratings
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
          console.log(`SkillGapChart - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
        }
      }
      
      // Only include categories with valid skills
      if (validSkillCount > 0) {
        // Calculate averages
        const avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
        const avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
        
        result.push({
          subject: category.title || "Unknown Category",
          current: avgCurrent,
          desired: avgDesired,
          fullMark: 10,
          skillCount: validSkillCount
        });
        
        console.log(`SkillGapChart - Category ${category.title}: avgCurrent=${avgCurrent}, avgDesired=${avgDesired} from ${validSkillCount} valid skills`);
      } else {
        console.log(`SkillGapChart - Category ${category.title || 'Unknown'} has no valid skills with ratings`);
      }
    }
    
    console.log("SkillGapChart - Final chart data items:", result.length);
    return result;
  }, [safeCategories]);

  // Filter to only show categories with actual data
  const validChartData = chartData.filter(
    item => item.skillCount && item.skillCount > 0 && 
           ((item.current > 0 || item.desired > 0) && 
           (!isNaN(item.current) && !isNaN(item.desired)))
  );
  
  console.log("SkillGapChart - Valid chart data items:", validChartData.length);
  
  if (validChartData.length === 0) {
    console.warn("SkillGapChart - No valid chart data to display");
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center">
          Complete the assessment to see your competency radar chart
        </p>
      </div>
    );
  }

  console.log("SkillGapChart - Rendering radar chart with data:", validChartData);

  // Radar chart implementation
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart 
        data={validChartData} 
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: '#4B5563', 
            fontSize: 12,
            fontWeight: 500
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

export default React.memo(SkillGapChart);
