import React, { useMemo, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar,
  Tooltip
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

// Custom tick component for competency names with enhanced PDF support
const CustomTick = (props: any) => {
  const { payload, x, y, cx, cy, textAnchor, index, isPDF } = props;
  
  // Calculate angle from center to current position
  const angle = Math.atan2(y - cy, x - cx);
  
  // PDF-specific label positioning for perfect circle
  const labelRadius = isPDF ? 100 : 175; // Reduced radius for PDF to keep labels closer
  
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
        
        // Shorter category names for PDF display to prevent clipping
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
  
  // DEBUG: Add effect to log DOM structure when component mounts
  useEffect(() => {
    if (chartContainerRef.current && validChartData.length > 0) {
      setTimeout(() => {
        console.log('=== SkillGapChart DOM INSPECTION ===');
        const container = chartContainerRef.current;
        if (container) {
          console.log('Chart container element:', container);
          console.log('Container outerHTML:', container.outerHTML.substring(0, 500) + '...');
          console.log('Container data-testid:', container.getAttribute('data-testid'));
          console.log('Container data-chart-type:', container.getAttribute('data-chart-type'));
          console.log('Container className:', container.className);
          
          const svg = container.querySelector('svg');
          if (svg) {
            console.log('Found SVG inside container:', svg);
            console.log('SVG className:', svg.className.baseVal || svg.className);
            console.log('SVG outerHTML preview:', svg.outerHTML.substring(0, 300) + '...');
          } else {
            console.log('No SVG found inside container');
          }
          
          // Check all SVGs in document
          const allSvgs = document.querySelectorAll('svg');
          console.log('Total SVGs in document:', allSvgs.length);
          allSvgs.forEach((svg, index) => {
            const rect = svg.getBoundingClientRect();
            console.log(`SVG ${index}:`, {
              className: svg.className.baseVal || svg.className,
              parent: svg.parentElement?.tagName,
              parentClass: svg.parentElement?.className,
              size: { width: rect.width, height: rect.height },
              isInRadarContainer: !!svg.closest('[data-testid="radar-chart-container"]')
            });
          });
        }
        console.log('=== END DOM INSPECTION ===');
      }, 1000);
    }
  }, [validChartData]);
  
  // DEBUG: Function to inspect DOM from inside the component
  const inspectDOM = () => {
    console.log('=== MANUAL DOM INSPECTION FROM CHART COMPONENT ===');
    const container = chartContainerRef.current;
    
    if (container) {
      console.log('Container found:', container);
      console.log('Container HTML:', container.outerHTML);
      
      const svg = container.querySelector('svg');
      if (svg) {
        console.log('SVG found:', svg);
        console.log('SVG HTML:', svg.outerHTML.substring(0, 500) + '...');
        
        // Try to capture this specific SVG
        try {
          const svgData = new XMLSerializer().serializeToString(svg);
          console.log('SVG serialized successfully, length:', svgData.length);
          
          // Create a test download
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'radar-chart-direct.svg';
          link.click();
          URL.revokeObjectURL(url);
          
          console.log('Direct SVG download triggered');
        } catch (error) {
          console.error('Error serializing SVG:', error);
        }
      } else {
        console.log('No SVG found in container');
      }
    } else {
      console.log('Container ref not found');
    }
    
    // Also test all the selectors we use in chartCapture
    const selectors = [
      '[data-testid="radar-chart-container"] svg',
      '[data-chart-type="radar"] svg', 
      '.radar-chart-container svg',
      '[data-testid="radar-chart-container"] .recharts-wrapper svg',
      '.recharts-radar-chart',
      'svg.recharts-surface',
      '.recharts-surface'
    ];
    
    console.log('Testing selectors:');
    selectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      console.log(`"${selector}": found ${found.length} elements`);
      if (found.length > 0) {
        console.log('First match:', found[0]);
      }
    });
    
    console.log('=== END MANUAL INSPECTION ===');
  };
  
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

  // PDF-specific configuration for perfect circle
  const chartMargins = isPDF 
    ? { top: 20, right: 50, left: 50, bottom: 60 } // Symmetric margins for PDF
    : { top: 50, right: 100, left: 100, bottom: 50 }; // Keep original for dashboard

  // PDF-specific centering and sizing for perfect circle
  const centerX = isPDF ? "50%" : "50%";
  const centerY = isPDF ? "50%" : "45%"; // Perfect center for PDF
  const outerRadius = isPDF ? "70%" : "85%"; // Slightly smaller for PDF to ensure perfect circle

  // Log DOM structure for debugging chart capture
  console.log("SkillGapChart - About to render with testid 'radar-chart-container'");

  // Radar chart implementation - removed Legend component to eliminate duplicate legend
  return (
    <div 
      ref={chartContainerRef}
      className={`radar-chart-container ${className} page-break-avoid`} 
      data-testid="radar-chart-container"
      data-chart-type="radar"
    >
      {/* DEBUG: Only show inspect button in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={inspectDOM}
            className="text-xs"
          >
            🔍 Inspect Chart DOM
          </Button>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={validChartData} 
          margin={chartMargins}
          cx={centerX}
          cy={centerY}
          outerRadius={outerRadius}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(SkillGapChart);
