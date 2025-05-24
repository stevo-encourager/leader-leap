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
    // Safely stringify categories to avoid circular references
    const safeCategoriesString = JSON.stringify(
      safeCategories.map(cat => ({
        title: cat.title,
        skillsCount: cat.skills?.length || 0,
        skills: cat.skills?.map(s => ({
          name: s.name,
          current: s.ratings?.current,
          desired: s.ratings?.desired,
        }))
      }))
    );
    console.log("SkillGapChart - Categories data:", safeCategoriesString.substring(0, 1000) + (safeCategoriesString.length > 1000 ? '...' : ''));
    
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
          console.log(`SkillGapChart - Skipping invalid skill (no ratings): ${skill?.name || 'unknown'}`);
          continue;
        }
        
        // Get ratings with detailed validation
        let current = 0;
        let desired = 0;
        
        // Handle current rating
        if (typeof skill.ratings.current === 'number') {
          current = skill.ratings.current;
        } else if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
          try {
            current = parseFloat(String(skill.ratings.current));
          } catch (e) {
            console.warn(`SkillGapChart - Error parsing current rating for ${skill.name}:`, e);
          }
        }
        
        // Handle desired rating
        if (typeof skill.ratings.desired === 'number') {
          desired = skill.ratings.desired;
        } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          try {
            desired = parseFloat(String(skill.ratings.desired));
          } catch (e) {
            console.warn(`SkillGapChart - Error parsing desired rating for ${skill.name}:`, e);
          }
        }
        
        // Ensure valid numbers
        current = isNaN(current) ? 0 : current;
        desired = isNaN(desired) ? 0 : desired;
        
        // Only include valid, non-zero ratings
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
          console.log(`SkillGapChart - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
        } else {
          console.log(`SkillGapChart - Skill with zero ratings: ${skill.name}`);
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
    if (result.length > 0) {
      console.log("SkillGapChart - Chart data sample:", result);
    }
    
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
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center mb-3">
          No valid assessment data available to display in the radar chart.
        </p>
        <p className="text-xs text-gray-400 text-center">
          Complete the assessment with valid current and desired skill ratings to see your competency radar chart.
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
        margin={{ top: 40, right: 60, left: 60, bottom: 40 }}
      >
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: '#2F564D', 
            fontSize: 14,
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
