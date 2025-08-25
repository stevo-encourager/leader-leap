
import { useMemo, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { Category } from '@/utils/assessmentTypes';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { chartLogger } from '@/utils/logger';

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
const PDF_RADAR_WIDTH = 480;
const PDF_RADAR_HEIGHT = 380;
const PDF_CONTAINER_WIDTH = 630; // Increased outer container for PDF to provide more margin for labels
const PDF_CONTAINER_HEIGHT = 530; // Increased height to accommodate longer labels
// Set label radius to 160 for PDF export (480x380px) to keep labels closer to center and prevent cut-off.
// If you change the chart size, adjust this value to be about 65% of the smallest dimension / 2.
const PDF_LABEL_RADIUS = 160;
const SCREEN_LABEL_RADIUS = 185; // For on-screen chart

// WARNING: If you change the chart size, you MUST update PDF_CONTAINER_WIDTH, PDF_CONTAINER_HEIGHT, and PDF_LABEL_RADIUS together!
// The PDF export depends on these being in sync to prevent label cutoff. See ResultsActions.tsx and chartCapture.ts for details.

// Custom tick component for competency names with optimized spacing
interface CustomTickProps {
  payload?: { value: string };
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  textAnchor?: string;
  index?: number;
  isPDF?: boolean;
  isMobile?: boolean;
}

const CustomTick = (props: CustomTickProps) => {
  const { payload, x, y, cx, cy, textAnchor, index, isPDF, isMobile } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Use centralized constants for label radius
  const labelRadius = isPDF ? PDF_LABEL_RADIUS : SCREEN_LABEL_RADIUS;
  
  const labelX = cx + labelRadius * Math.cos(angle);
  const labelY = cy + labelRadius * Math.sin(angle);
  
  // Split longer labels onto two lines for PDF only
  const splitLabel = (text: string) => {
    const longLabels = {
      'Strategic Thinking/Vision': ['Strategic', 'Thinking/Vision'],
      'Team Leadership': ['Team Leadership'],
      'Negotiation & Conflict Resolution': ['Negotiation &', 'Conflict Resolution'],
      'Delegation & Empowerment': ['Delegation &', 'Empowerment'],
      'Time/Priority Management': ['Time/Priority', 'Management']
    };
    
    return longLabels[text] || [text];
  };
  
  // Only split labels for PDF generation, keep single line for main app
  const labelLines = isPDF ? splitLabel(payload.value) : [payload.value];
  
  // Determine text anchor based on position relative to center
  let anchor = 'middle';
  if (labelX > cx + 5) anchor = 'start';
  else if (labelX < cx - 5) anchor = 'end';
  
  // Always show full labels to ensure consistency across environments
  const displayText = payload.value;
  
  return (
    <g>
      {labelLines.map((line, lineIndex) => (
        <text
          key={lineIndex}
          x={labelX}
          y={labelY + (lineIndex * (isPDF ? 12 : 14)) - ((labelLines.length - 1) * (isPDF ? 6 : 7))}
          textAnchor={anchor}
          dominantBaseline="middle"
          fill="#2F564D"
          fontSize={isPDF ? "10" : "14"}
          fontWeight="500"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const SkillGapChart: React.FC<SkillGapChartProps> = ({ categories, className = "", isPDF = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Force desktop rendering for PDF generation to ensure consistency across devices
  const effectiveIsMobile = isPDF ? false : isMobile;
  

  
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
      chartLogger.warn("No categories provided");
      return [];
    }
    
    const result: ChartData[] = [];
    
    for (const category of safeCategories) {
      if (!category || !category.skills || !Array.isArray(category.skills)) {
        chartLogger.debug('Skipping invalid category', { title: category?.title || 'unknown' });
        continue;
      }
      
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      for (const skill of category.skills) {
        if (!skill || !skill.ratings) {
          chartLogger.debug('Skipping invalid skill (no ratings)', { name: skill?.name || 'unknown' });
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
            chartLogger.warn('Error parsing current rating', { skillName: skill.name, error: e });
          }
        }
        
        if (typeof skill.ratings.desired === 'number') {
          desired = skill.ratings.desired;
        } else if (skill.ratings.desired !== undefined && skill.ratings.desired !== null) {
          try {
            desired = parseFloat(String(skill.ratings.desired));
          } catch (e) {
            chartLogger.warn('Error parsing desired rating', { skillName: skill.name, error: e });
          }
        }
        
        current = isNaN(current) ? 0 : current;
        desired = isNaN(desired) ? 0 : desired;
        
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
  
        } else {
          chartLogger.debug('Skill with zero ratings', { name: skill.name });
        }
      }
      
      if (validSkillCount > 0) {
        const avgCurrent = parseFloat((totalCurrent / validSkillCount).toFixed(1));
        const avgDesired = parseFloat((totalDesired / validSkillCount).toFixed(1));
        const displayTitle = category.title || "Unknown Category";
        result.push({
          subject: displayTitle,
          current: avgCurrent,
          desired: avgDesired,
          fullMark: 10,
          skillCount: validSkillCount
        });
        

      } else {
        chartLogger.debug('Category has no valid skills with ratings', { title: category.title || 'Unknown' });
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
    chartLogger.warn("No valid chart data to display");
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



  // Optimized chart margins for mobile and larger chart size - symmetric margins for perfect radar chart
  const chartMargins = isPDF 
    ? { top: 50, right: 50, left: 50, bottom: 50 } // Equal margins for PDF symmetry
    : effectiveIsMobile
    ? { top: 20, right: 20, left: 20, bottom: 20 } // Equal margins for mobile symmetry
    : { top: 40, right: 40, left: 40, bottom: 40 }; // Reduced equal margins for desktop - larger chart while maintaining symmetry



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
        height: isPDF ? `${PDF_CONTAINER_HEIGHT}px` : 'min(100%, 600px)',
        backgroundColor: 'white',
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gridTemplateAreas: '"chart" "legend"',
        gap: isPDF ? '0' : '4px',
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
              tick={(props) => <CustomTick {...props} isPDF={isPDF} isMobile={isMobile} />}
            />
            <PolarRadiusAxis 
              domain={[0, 10]} 
              tick={false}
              axisLine={false}
              tickLine={false}
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
    </div>
  );
};

export default SkillGapChart;
