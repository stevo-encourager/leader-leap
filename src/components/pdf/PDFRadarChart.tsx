
import React from 'react';
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
}

// PDF-optimized custom tick component
const PDFCustomTick = (props: any) => {
  const { payload, x, y, cx, cy } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Conservative radius for PDF to prevent clipping
  const labelRadius = 120;
  
  const labelX = cx + labelRadius * Math.cos(angle);
  const labelY = cy + labelRadius * Math.sin(angle);
  
  // Determine text anchor based on position
  let anchor = 'middle';
  if (labelX > cx + 5) anchor = 'start';
  else if (labelX < cx - 5) anchor = 'end';
  
  // Shorter labels for PDF
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
  // Process chart data for PDF
  const chartData: ChartData[] = React.useMemo(() => {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    const result: ChartData[] = [];
    
    for (const category of categories) {
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
        
        const current = typeof skill.ratings.current === 'number' ? skill.ratings.current : 0;
        const desired = typeof skill.ratings.desired === 'number' ? skill.ratings.desired : 0;
        
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
        }
      }
      
      if (validSkillCount > 0) {
        const avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
        const avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
        
        // Shorter category names for PDF
        const displayTitle = category.title && category.title.length > 15 
          ? category.title.substring(0, 12) + '...' 
          : category.title || "Unknown";
        
        result.push({
          subject: displayTitle,
          current: avgCurrent,
          desired: avgDesired,
          fullMark: 10
        });
      }
    }
    
    return result;
  }, [categories]);

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-gray-500 text-center text-sm">
          No assessment data available
        </p>
      </div>
    );
  }

  return (
    <div className={`pdf-radar-chart ${className}`} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={chartData} 
          margin={{ top: 5, right: 25, left: 25, bottom: 45 }}
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
            tick={(props) => <PDFCustomTick {...props} />}
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

export default PDFRadarChart;
