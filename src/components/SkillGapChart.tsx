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
  className?: string;
  isPDF?: boolean;
}

interface ChartData {
  subject: string;
  current: number;
  desired: number;
  fullMark: number;
  skillCount?: number;
}

// Custom tick component for competency names with enhanced PDF support
const CustomTick = (props: any) => {
  const { payload, x, y, cx, cy, textAnchor, index, isPDF } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Use much more conservative radius for PDF to prevent clipping
  const labelRadius = isPDF ? 120 : 175;
  
  const labelX = cx + labelRadius * Math.cos(angle);
  const labelY = cy + labelRadius * Math.sin(angle);
  
  // Determine text anchor based on position relative to center
  let anchor = 'middle';
  if (labelX > cx + 5) anchor = 'start';
  else if (labelX < cx - 5) anchor = 'end';
  
  // Much shorter labels for PDF to prevent overlap and clipping
  const displayText = isPDF && payload.value.length > 12 
    ? payload.value.substring(0, 10) + '...' 
    : payload.value;
  
  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill="#2F564D"
      fontSize={isPDF ? "10" : "14"}
      fontWeight="500"
    >
      {displayText}
    </text>
  );
};

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories, className = "", isPDF = false }) => {
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
        
        // Much shorter category names for PDF display to prevent clipping
        const displayTitle = isPDF && category.title && category.title.length > 15 
          ? category.title.substring(0, 12) + '...' 
          : category.title || "Unknown Category";
        
        result.push({
          subject: displayTitle,
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
  }, [safeCategories, isPDF]);

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
      <div className={`flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg p-6 ${className}`}>
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

  // More conservative margins and positioning for PDF with reduced bottom margin
  const chartMargins = isPDF 
    ? { top: 20, right: 40, left: 40, bottom: 60 } // Reduced bottom margin from 100 to 60
    : { top: 50, right: 100, left: 100, bottom: 50 };

  // Radar chart implementation with PDF-optimized settings to prevent clipping
  return (
    <div className={`radar-chart-container ${className} page-break-avoid`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={validChartData} 
          margin={chartMargins}
          cx="50%" 
          cy={isPDF ? "35%" : "45%"} // Much higher position in PDF to leave more room for legend
          outerRadius={isPDF ? "45%" : "75%"} // Much smaller radius in PDF to prevent clipping
        >
          <PolarGrid 
            strokeDasharray="2 2" 
            stroke="#94a3b8"
            strokeWidth={1.2}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="subject"
            tick={(props) => <CustomTick {...props} isPDF={isPDF} />}
          />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="#2F564D"
            fill="#2F564D"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Radar
            name="Desired Level"
            dataKey="desired"
            stroke="#8baca5"
            fill="#8baca5"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip />
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              marginTop: isPDF ? '30px' : '60px', // Reduced margin in PDF
              fontSize: isPDF ? '11px' : '18px',
              fontWeight: 'normal',
              paddingBottom: isPDF ? '10px' : '0px' // Reduced padding
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(SkillGapChart);
