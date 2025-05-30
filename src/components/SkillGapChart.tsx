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
  
  // Adjusted label radius - slightly further out to prevent overlap with chart
  const labelRadius = isPDF ? 110 : 155; // Increased from 100/140 to 110/155
  
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
  
  console.log("SkillGapChart - Categories count:", safeCategories.length);
  console.log("SkillGapChart - isPDF:", isPDF);
  console.log("SkillGapChart - Should show legend:", !isPDF);
  
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
    console.log("SkillGapChart - Categories data:", safeCategoriesString.substring(0, 1000) + (safeCategoriesString.length > 1000 ? '...' : ''));
    
    const totalSkills = safeCategories.reduce((total, cat) => total + (cat.skills?.length || 0), 0);
    console.log("SkillGapChart - Total skills:", totalSkills);
    
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
          console.log(`SkillGapChart - Valid skill: ${skill.name}, current=${current}, desired=${desired}`);
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

  const validChartData = chartData.filter(
    item => item.skillCount && item.skillCount > 0 && 
           ((item.current > 0 || item.desired > 0) && 
           (!isNaN(item.current) && !isNaN(item.desired)))
  );
  
  console.log("SkillGapChart - Valid chart data items:", validChartData.length);
  
  // Enhanced DOM structure logging for chart capture debugging
  useEffect(() => {
    if (chartContainerRef.current && validChartData.length > 0) {
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
          
          // DEBUG: Check for legend element specifically
          const legendElement = container.querySelector('[style*="gridArea"]');
          console.log('Legend element found:', !!legendElement);
          if (legendElement) {
            console.log('Legend element details:', {
              element: legendElement,
              computedStyle: window.getComputedStyle(legendElement),
              offsetWidth: (legendElement as HTMLElement).offsetWidth,
              offsetHeight: (legendElement as HTMLElement).offsetHeight,
              display: window.getComputedStyle(legendElement).display,
              visibility: window.getComputedStyle(legendElement).visibility,
              opacity: window.getComputedStyle(legendElement).opacity
            });
          }
        }
        
        const captureSelectors = [
          '[data-testid="radar-chart-container"]',
          '[data-chart-type="radar"]',
          '.radar-chart-container',
          '.recharts-radar-chart',
          '.recharts-surface'
        ];
        
        console.log('Testing chart capture selectors:');
        captureSelectors.forEach(selector => {
          const found = document.querySelectorAll(selector);
          console.log(`Selector "${selector}": found ${found.length} elements`);
          if (found.length > 0) {
            const first = found[0] as HTMLElement;
            console.log(`  First match dimensions: ${first.offsetWidth}x${first.offsetHeight}`);
          }
        });
        
        console.log('=== END ENHANCED DOM INSPECTION ===');
      }, 1000);
    }
  }, [validChartData]);
  
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
        gap: isPDF ? '0' : '16px', // Reduced gap slightly for better spacing
        overflow: 'visible',
        paddingBottom: isPDF ? '0' : '20px' // Add bottom padding to prevent legend cropping
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
