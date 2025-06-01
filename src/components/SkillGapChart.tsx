
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

// Custom tick component for competency names with optimized spacing
const CustomTick = (props: any) => {
  const { payload, x, y, cx, cy, textAnchor, index, isPDF } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // Adjusted label radius - moved to maximum distance for ultimate breathing room
  const labelRadius = isPDF ? 130 : 185; // Increased from 125/180 to 130/185
  
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
  
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  console.log("SkillGapChart - DEBUGGING: Categories received:", {
    categoriesLength: safeCategories.length,
    isPDF,
    categoriesData: safeCategories.map(cat => ({
      title: cat?.title,
      skillsCount: cat?.skills?.length || 0,
      hasSkills: Array.isArray(cat?.skills),
      firstSkillRatings: cat?.skills?.[0]?.ratings
    }))
  });
  
  // Process chart data with simplified validation
  const chartData = useMemo(() => {
    console.log("SkillGapChart - DEBUGGING: Processing chart data");
    
    if (!safeCategories || safeCategories.length === 0) {
      console.log("SkillGapChart - DEBUGGING: No categories to process");
      return [];
    }
    
    const result: ChartData[] = [];
    
    for (const category of safeCategories) {
      // Basic category validation
      if (!category || !category.title) {
        console.log("SkillGapChart - DEBUGGING: Skipping category without title");
        continue;
      }
      
      // Check if category has skills
      if (!category.skills || !Array.isArray(category.skills) || category.skills.length === 0) {
        console.log(`SkillGapChart - DEBUGGING: Category "${category.title}" has no valid skills`);
        continue;
      }
      
      let totalCurrent = 0;
      let totalDesired = 0;
      let validSkillCount = 0;
      
      // Process each skill in the category
      for (const skill of category.skills) {
        if (!skill || !skill.ratings) {
          continue;
        }
        
        // Get ratings with more flexible parsing
        const currentRating = skill.ratings.current;
        const desiredRating = skill.ratings.desired;
        
        // Convert to numbers and validate
        let current = 0;
        let desired = 0;
        
        if (currentRating !== null && currentRating !== undefined) {
          current = Number(currentRating);
          if (isNaN(current)) current = 0;
        }
        
        if (desiredRating !== null && desiredRating !== undefined) {
          desired = Number(desiredRating);
          if (isNaN(desired)) desired = 0;
        }
        
        // Only count skills that have at least one valid rating
        if (current > 0 || desired > 0) {
          totalCurrent += current;
          totalDesired += desired;
          validSkillCount++;
          
          console.log(`SkillGapChart - DEBUGGING: Valid skill "${skill.name}": current=${current}, desired=${desired}`);
        }
      }
      
      // Add category to chart data if it has valid skills
      if (validSkillCount > 0) {
        const avgCurrent = totalCurrent / validSkillCount;
        const avgDesired = totalDesired / validSkillCount;
        
        const displayTitle = isPDF && category.title.length > 15 
          ? category.title.substring(0, 12) + '...' 
          : category.title;
        
        const categoryData = {
          subject: displayTitle,
          current: Number(avgCurrent.toFixed(1)),
          desired: Number(avgDesired.toFixed(1)),
          fullMark: 10,
          skillCount: validSkillCount
        };
        
        result.push(categoryData);
        
        console.log(`SkillGapChart - DEBUGGING: Added category "${category.title}" to chart:`, categoryData);
      } else {
        console.log(`SkillGapChart - DEBUGGING: Category "${category.title}" has no valid skills with ratings`);
      }
    }
    
    console.log("SkillGapChart - DEBUGGING: Final chart data:", result);
    return result;
  }, [safeCategories, isPDF]);

  // Enhanced DOM structure logging for chart capture debugging
  useEffect(() => {
    if (chartContainerRef.current && chartData.length > 0) {
      setTimeout(() => {
        console.log('=== ENHANCED CHART DOM INSPECTION FOR CAPTURE ===');
        const container = chartContainerRef.current;
        
        if (container) {
          console.log('Chart container found:', {
            element: container,
            testId: container.getAttribute('data-testid'),
            chartType: container.getAttribute('data-chart-type'),
            className: container.className,
            offsetWidth: container.offsetWidth,
            offsetHeight: container.offsetHeight,
            isVisible: container.offsetWidth > 0 && container.offsetHeight > 0,
            parentElement: container.parentElement?.tagName,
            children: container.children.length
          });
          
          const svgInContainer = container.querySelector('svg');
          if (svgInContainer) {
            console.log('SVG found in radar container:', {
              element: svgInContainer,
              className: svgInContainer.className.baseVal || svgInContainer.className,
              width: svgInContainer.getAttribute('width'),
              height: svgInContainer.getAttribute('height'),
              viewBox: svgInContainer.getAttribute('viewBox'),
              children: svgInContainer.children.length
            });
            
            const rechartsWrapper = container.querySelector('.recharts-wrapper');
            const rechartsRadar = container.querySelector('.recharts-radar-chart');
            const rechartsRadarElements = container.querySelectorAll('[class*="recharts-radar"]');
            
            console.log('Recharts elements found:', {
              wrapper: !!rechartsWrapper,
              radarChart: !!rechartsRadar,
              radarElements: rechartsRadarElements.length
            });
          } else {
            console.warn('No SVG found in radar chart container!');
          }
        }
        
        console.log('=== END ENHANCED DOM INSPECTION ===');
      }, 1000);
    }
  }, [chartData]);
  
  // Check if we have valid data to display
  if (chartData.length === 0) {
    console.log("SkillGapChart - DEBUGGING: No valid chart data to display");
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

  console.log("SkillGapChart - DEBUGGING: Rendering radar chart with valid data");

  // Optimized chart margins for larger chart size
  const chartMargins = isPDF 
    ? { top: 20, right: 50, left: 50, bottom: 20 } // Reduced margins for PDF
    : { top: 20, right: 80, left: 80, bottom: 20 }; // Reduced margins for larger chart

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
        width: '100%',
        height: isPDF ? '400px' : '600px',
        backgroundColor: 'white',
        display: 'grid',
        gridTemplateRows: isPDF ? '1fr' : '1fr auto',
        gridTemplateAreas: isPDF ? '"chart"' : '"chart" "legend"',
        gap: isPDF ? '0' : '16px',
        overflow: 'visible',
        paddingBottom: isPDF ? '0' : '20px'
      }}
    >
      {/* Chart area with proper grid positioning */}
      <div 
        style={{ 
          gridArea: 'chart',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart 
            data={chartData} 
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
            padding: '16px 16px 24px 16px',
            borderRadius: '8px',
            marginBottom: '8px'
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
