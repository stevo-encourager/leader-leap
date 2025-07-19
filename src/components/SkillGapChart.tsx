
import React, { useMemo, useRef, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  fullLabel?: string; // Added for PDF full label
}

// PDF export constants (centralized for consistency)
const PDF_RADAR_WIDTH = 500;
const PDF_RADAR_HEIGHT = 400;
const PDF_CONTAINER_WIDTH = 540; // Outer container for PDF, gives margin for labels
const PDF_CONTAINER_HEIGHT = 440;
// Set label radius to 160 for PDF export (500x400px) to keep labels just inside the edge and prevent cut-off.
// If you change the chart size, adjust this value to be about 80% of the smallest dimension / 2.
const PDF_LABEL_RADIUS = 160;
const SCREEN_LABEL_RADIUS = 185; // For on-screen chart

// WARNING: If you change the chart size, you MUST update PDF_CONTAINER_WIDTH, PDF_CONTAINER_HEIGHT, and PDF_LABEL_RADIUS together!
// The PDF export depends on these being in sync to prevent label cutoff. See ResultsActions.tsx and chartCapture.ts for details.

// Custom tick component for competency names with optimized spacing
const CustomTick = (props: any) => {
  const { payload, x, y, cx, cy, textAnchor, index, isPDF } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Use centralized constants for label radius
  const labelRadius = isPDF ? PDF_LABEL_RADIUS : SCREEN_LABEL_RADIUS;
  
  const labelX = cx + labelRadius * Math.cos(angle);
  const labelY = cy + labelRadius * Math.sin(angle);
  
  // Determine text anchor based on position relative to center
  let anchor = 'middle';
  if (labelX > cx + 5) anchor = 'start';
  else if (labelX < cx - 5) anchor = 'end';
  
  // Shorter labels for PDF to prevent overlap
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  

  
  if (safeCategories.length > 0) {
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

  }
  
  // Process chart data
  const chartData = useMemo(() => {
    
    if (!safeCategories || safeCategories.length === 0) {
      console.warn("SkillGapChart - No categories provided");
      return [];
    }
    
    const result: ChartData[] = [];
    
    for (const category of safeCategories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        console.log(`SkillGapChart - Skipping invalid category: ${category?.title || 'unknown'}`);
        continue;
      }
      
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      for (const skill of category.skills) {
        if (!skill || !skill.ratings) {
          console.log(`SkillGapChart - Skipping invalid skill (no ratings): ${skill?.name || 'unknown'}`);
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
            console.warn(`SkillGapChart - Error parsing current rating for ${skill.name}:`, e);
          }
        }
        
        if (typeof skill.ratings.desired === 'number') {
          desired = skill.ratings.desired;
        } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          try {
            desired = parseFloat(String(skill.ratings.desired));
          } catch (e) {
            console.warn(`SkillGapChart - Error parsing desired rating for ${skill.name}:`, e);
          }
        }
        
        current = isNaN(current) ? 0 : current;
        desired = isNaN(desired) ? 0 : desired;
        
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
  
        } else {
          console.log(`SkillGapChart - Skill with zero ratings: ${skill.name}`);
        }
      }
      
      if (validSkillCount > 0) {
        const avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
        const avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
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
        

      } else {
        console.log(`SkillGapChart - Category ${category.title || 'Unknown'} has no valid skills with ratings`);
      }
    }
    

    
    return result;
  }, [safeCategories, isPDF]);

  const validChartData = chartData.filter(
    item => item.skillCount && item.skillCount > 0 && 
           ((item.current > 0 || item.desired > 0) && 
           (!isNaN(item.current) && !isNaN(item.desired)))
  );
  

  

  
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



  // Optimized chart margins for mobile and larger chart size
  const chartMargins = isPDF 
    ? { top: 20, right: 50, left: 50, bottom: 20 } // Reduced margins for PDF
    : isMobile
    ? { top: 10, right: 20, left: 20, bottom: 10 } // Much smaller margins for mobile
    : { top: 20, right: 80, left: 80, bottom: 20 }; // Original margins for desktop

  /**
   * CRITICAL FOR PDF EXPORT: This container MUST always have data-testid="radar-chart-container"
   * The PDF export function captureRadarChartAsPNG() depends on this attribute to find and capture the chart.
   * DO NOT REMOVE OR CHANGE this data-testid attribute - it will break PDF exports!
   */
  return (
    <div 
      ref={chartContainerRef}
      className={`radar-chart-container ${className} page-break-avoid`} 
      data-testid="radar-chart-container"
      data-chart-type="radar"
      id="radar-chart-container"
      style={{
        width: isPDF ? `${PDF_CONTAINER_WIDTH}px` : '100%',
        height: isPDF ? `${PDF_CONTAINER_HEIGHT}px` : '600px',
        backgroundColor: 'white',
        display: 'grid',
        gridTemplateRows: isPDF ? '1fr' : '1fr auto',
        gridTemplateAreas: isPDF ? '"chart"' : '"chart" "legend"',
        gap: isPDF ? '0' : '16px',
        overflow: 'visible',
        paddingBottom: isPDF ? '0' : '20px',
        placeItems: isPDF ? 'center' : undefined, // Center chart in PDF container
        position: isPDF ? 'relative' : undefined
      }}
    >
      {/* Chart area with proper grid positioning */}
      <div 
        style={{ 
          gridArea: 'chart',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          width: isPDF ? `${PDF_RADAR_WIDTH}px` : '100%',
          height: isPDF ? `${PDF_RADAR_HEIGHT}px` : '100%',
          margin: isPDF ? 'auto' : undefined // Center chart in container for PDF
        }}
      >
        {/* ResponsiveContainer always fills parent for both PDF and screen */}
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            data={validChartData} 
            margin={chartMargins}
            className="recharts-radar-chart"
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
              name={isPDF ? "Current State" : "Current Level"}
              dataKey="current"
              stroke="#2F564D"
              fill="#2F564D"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar
              name={isPDF ? "Desired State" : "Desired Level"}
              dataKey="desired"
              stroke="#8baca5"
              fill="#8baca5"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend area - Clean styling with proper visual separation */}
      {!isPDF && (
        <div 
          style={{ 
            gridArea: 'legend',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            minHeight: 'auto',
            height: 'auto',
            backgroundColor: 'white',
            padding: '16px 16px 24px 16px', // Extra bottom padding to prevent cropping
            borderRadius: '8px',
            marginBottom: '8px' // Additional margin to ensure full visibility
          }}
        >
          {/* Horizontal separator line */}
          <div style={{ 
            width: '100%', 
            height: '1px', 
            backgroundColor: '#e2e8f0',
            flexShrink: 0
          }}></div>
          
          {/* Legend items */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            fontSize: '14px',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#2F564D', 
                opacity: 0.6,
                flexShrink: 0,
                borderRadius: '2px'
              }}></div>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Current Level</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: '#8baca5', 
                opacity: 0.6,
                flexShrink: 0,
                borderRadius: '2px'
              }}></div>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Desired Level</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillGapChart);
