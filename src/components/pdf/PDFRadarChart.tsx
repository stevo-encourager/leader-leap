
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

interface PDFRadarChartProps {
  categories: Category[];
  className?: string;
}

interface ChartData {
  subject: string;
  current: number;
  desired: number;
  fullMark: number;
  skillCount?: number;
}

// PDF-specific custom tick component with optimized sizing
const PDFCustomTick = (props: any) => {
  const { payload, x, y, cx, cy } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Conservative radius for PDF to prevent clipping
  const labelRadius = 120;
  
  const labelX = cx + labelRadius * Math.cos(angle);
  const labelY = cy + labelRadius * Math.sin(angle);
  
  // Determine text anchor based on position relative to center
  let anchor = 'middle';
  if (labelX > cx + 5) anchor = 'start';
  else if (labelX < cx - 5) anchor = 'end';
  
  // Shorter labels for PDF to prevent overlap and clipping
  const displayText = payload.value.length > 12 
    ? payload.value.substring(0, 10) + '...' 
    : payload.value;
  
  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={anchor}
      dominantBaseline="middle"
      fill="#2F564D"
      fontSize="10"
      fontWeight="500"
    >
      {displayText}
    </text>
  );
};

const PDFRadarChart: React.FC<PDFRadarChartProps> = ({ categories, className = "" }) => {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // Process chart data
  const chartData = useMemo(() => {
    if (!safeCategories || safeCategories.length === 0) {
      return [];
    }
    
    const result: ChartData[] = [];
    
    for (const category of safeCategories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        continue;
      }
      
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      for (const skill of category.skills) {
        if (!skill || !skill.ratings) {
          continue;
        }
        
        let current = 0;
        let desired = 0;
        
        if (typeof skill.ratings.current === 'number') {
          current = skill.ratings.current;
        } else if (skill.ratings.current !== undefined && skill.ratings.current !== null) {
          try {
            current = parseFloat(String(skill.ratings.current));
          } catch (e) {
            // Silent fallback
          }
        }
        
        if (typeof skill.ratings.desired === 'number') {
          desired = skill.ratings.desired;
        } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          try {
            desired = parseFloat(String(skill.ratings.desired));
          } catch (e) {
            // Silent fallback
          }
        }
        
        current = isNaN(current) ? 0 : current;
        desired = isNaN(desired) ? 0 : desired;
        
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
        }
      }
      
      if (validSkillCount > 0) {
        const avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
        const avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
        
        // Shorter category names for PDF display
        const displayTitle = category.title && category.title.length > 15 
          ? category.title.substring(0, 12) + '...' 
          : category.title || "Unknown Category";
        
        result.push({
          subject: displayTitle,
          current: avgCurrent,
          desired: avgDesired,
          fullMark: 10,
          skillCount: validSkillCount
        });
      }
    }
    
    return result;
  }, [safeCategories]);

  // Filter to only show categories with actual data
  const validChartData = chartData.filter(
    item => item.skillCount && item.skillCount > 0 && 
           ((item.current > 0 || item.desired > 0) && 
           (!isNaN(item.current) && !isNaN(item.desired)))
  );
  
  if (validChartData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-slate-50 rounded-lg p-6 ${className}`}>
        <p className="text-gray-500 text-center mb-3">
          No valid assessment data available to display in the radar chart.
        </p>
      </div>
    );
  }

  // PDF-optimized margins
  const chartMargins = { top: 5, right: 25, left: 25, bottom: 45 };

  return (
    <div className={`radar-chart-container ${className} page-break-avoid`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={validChartData} 
          margin={chartMargins}
          cx="50%" 
          cy="38%"
          outerRadius="52%"
        >
          <PolarGrid 
            strokeDasharray="2 2" 
            stroke="#94a3b8"
            strokeWidth={1.2}
            gridType="polygon"
          />
          <PolarAngleAxis 
            dataKey="subject"
            tick={PDFCustomTick}
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
              marginTop: '20px',
              fontSize: '11px',
              fontWeight: 'normal',
              paddingBottom: '5px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(PDFRadarChart);
