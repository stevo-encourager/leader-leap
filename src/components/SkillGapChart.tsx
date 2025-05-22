
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
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories }) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  console.log("SkillGapChart - Received categories:", safeCategories?.length || 0);
  
  // Process chart data with detailed logging
  const chartData = useMemo(() => {
    console.log("SkillGapChart - Processing categories for chart data");
    
    if (!safeCategories || safeCategories.length === 0) {
      console.warn("SkillGapChart - No valid categories provided");
      return [];
    }
    
    // Debug first category
    if (safeCategories.length > 0) {
      const firstCat = safeCategories[0];
      console.log("SkillGapChart - First category sample:", {
        title: firstCat?.title,
        skillsCount: firstCat?.skills?.length || 0
      });
      
      // Debug first skill in first category
      if (firstCat?.skills && firstCat.skills.length > 0) {
        const firstSkill = firstCat.skills[0];
        console.log("SkillGapChart - First skill sample:", {
          name: firstSkill?.name,
          ratings: firstSkill?.ratings
        });
      }
    }
    
    const result = safeCategories.map(category => {
      if (!category) {
        console.warn("SkillGapChart - Found undefined category in array");
        return {
          subject: "Unknown Category",
          current: 0,
          desired: 0,
          fullMark: 10
        };
      }
      
      // Default values
      let avgCurrent = 0;
      let avgDesired = 0;
      let skillCount = 0;
      
      // Process skills if they exist
      if (category.skills && Array.isArray(category.skills) && category.skills.length > 0) {
        let totalCurrent = 0;
        let totalDesired = 0;
        let validSkillCount = 0;
        
        // Count valid skills and sum ratings
        for (const skill of category.skills) {
          if (!skill || !skill.ratings) continue;
          
          const current = typeof skill.ratings.current === 'number' 
            ? skill.ratings.current 
            : parseFloat(String(skill.ratings.current || '0'));
            
          const desired = typeof skill.ratings.desired === 'number' 
            ? skill.ratings.desired 
            : parseFloat(String(skill.ratings.desired || '0'));
          
          if (!isNaN(current) && !isNaN(desired) && (current > 0 || desired > 0)) {
            totalCurrent += current;
            totalDesired += desired;
            validSkillCount++;
            console.log(`SkillGapChart - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
          } else {
            console.log(`SkillGapChart - Skipping invalid skill ratings: ${skill.name}, current=${skill.ratings.current}, desired=${skill.ratings.desired}`);
          }
        }
        
        // Calculate averages
        if (validSkillCount > 0) {
          avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
          avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
          console.log(`SkillGapChart - Category ${category.title}: avgCurrent=${avgCurrent}, avgDesired=${avgDesired} from ${validSkillCount} valid skills`);
        } else {
          console.log(`SkillGapChart - Category ${category.title}: No valid skills with ratings`);
        }
        
        skillCount = validSkillCount;
      } else {
        console.log(`SkillGapChart - Category ${category.title || 'Unknown'}: No valid skills array`);
      }
      
      return {
        subject: category.title || "Unknown Category",
        current: avgCurrent,
        desired: avgDesired,
        fullMark: 10,
        skillCount // Store for filtering
      };
    });
    
    console.log("SkillGapChart - Processed chart data:", result);
    return result;
  }, [safeCategories]);

  // Filter to only show categories with actual data
  const validChartData = chartData.filter(
    item => item.skillCount > 0 && ((item.current > 0 || item.desired > 0) && 
           (!isNaN(item.current) && !isNaN(item.desired)))
  );
  
  console.log("SkillGapChart - Valid chart data items:", validChartData.length);
  
  if (validChartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg p-6">
        <p className="text-gray-500 text-center">
          Complete the assessment to see your competency radar chart
        </p>
      </div>
    );
  }

  // Simplified radar chart implementation
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
