
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
    console.log("SkillGapChart - Categories received:", categories);
    
    // If no categories, return early
    if (!categories || categories.length === 0) {
      console.log("No categories to display in chart");
      return;
    }

    // Process the data for the chart
    const preparedData: ChartData[] = categories
      .filter(category => {
        // Ensure we have a valid category with skills
        if (!category || !category.title) {
          console.warn("Invalid category object:", category);
          return false;
        }
        
        if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
          console.warn(`Category ${category.title} has no valid skills array`);
          return false;
        }
        
        return true;
      })
      .map(category => {
        // Calculate average for each category
        const totalSkills = category.skills.length;
        let sumCurrent = 0;
        let sumDesired = 0;
        let validSkillCount = 0;
        
        category.skills.forEach(skill => {
          // Try to get ratings - handle both number and string cases
          const skillName = skill.name || (skill as any).competency || 'unnamed';
          
          // Ensure we have ratings object
          if (!skill.ratings) {
            console.warn(`Skill ${skillName} in ${category.title} has no ratings`);
            return;
          }
          
          let currentRating = typeof skill.ratings.current === 'number' 
            ? skill.ratings.current 
            : parseFloat(String(skill.ratings.current || '0'));
            
          let desiredRating = typeof skill.ratings.desired === 'number' 
            ? skill.ratings.desired 
            : parseFloat(String(skill.ratings.desired || '0'));
          
          // Additional validation to ensure we have valid ratings
          if (!isNaN(currentRating) && !isNaN(desiredRating)) {
            console.log(`Valid skill rating for ${skillName}: current=${currentRating}, desired=${desiredRating}`);
            sumCurrent += currentRating;
            sumDesired += desiredRating;
            validSkillCount++;
          } else {
            console.warn(`Invalid ratings for skill: ${skillName}`, skill.ratings);
          }
        });
        
        const categoryAvgCurrent = validSkillCount > 0 ? sumCurrent / validSkillCount : 0;
        const categoryAvgDesired = validSkillCount > 0 ? sumDesired / validSkillCount : 0;
        
        console.log(`Category ${category.title} - Average current: ${categoryAvgCurrent}, Average desired: ${categoryAvgDesired}, Valid skills: ${validSkillCount}`);
        
        return {
          subject: category.title,
          current: parseFloat(categoryAvgCurrent.toFixed(2)),
          desired: parseFloat(categoryAvgDesired.toFixed(2)),
          fullMark: 10
        };
      });
    
    console.log("SkillGapChart - Prepared chart data:", preparedData);
    setChartData(preparedData);
  }, [categories]);

  // Handle empty data cases
  if (!categories || categories.length === 0) {
    return <div className="text-center p-6">No assessment data available</div>;
  }

  if (chartData.length === 0) {
    return <div className="text-center p-6">Processing chart data...</div>;
  }
  
  // Check if we actually have data to show after processing
  const hasValidData = chartData.some(item => item.current > 0 || item.desired > 0);
  
  if (!hasValidData) {
    return <div className="text-center p-6">No valid rating data found to display chart</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <PolarGrid />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ 
            fill: '#333', 
            fontSize: 12
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

export default SkillGapChart;
