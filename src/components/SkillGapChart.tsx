
import { useMemo, useRef, useEffect } from 'react';
import { 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Customized
} from 'recharts';
import { Category } from '@/utils/assessmentTypes';
import {
  RADAR_THEME,
  PDF_CAPTURE_WIDTH,
  PDF_CAPTURE_HEIGHT,
  hexToRgba,
  resolveGroupSpans,
  polarPoint,
  type GroupSpan
} from './skillGapChartTheme';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { chartLogger } from '@/utils/logger';

interface SkillGapChartProps {
  categories: Category[];
  className?: string;
  isPDF?: boolean;
}

interface ChartData {
  /** Stable category ID - used to match categories to their competency group. */
  id: string;
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
// Capture-box size now lives in skillGapChartTheme so ReactPDFDocument can derive
// its embedded image aspect from the same numbers. Tall enough for the radar plus
// BOTH legend rows; html2canvas captures at offsetWidth/offsetHeight, so anything
// overflowing this box is clipped out of the PDF image.
const PDF_CONTAINER_WIDTH = PDF_CAPTURE_WIDTH;
const PDF_CONTAINER_HEIGHT = PDF_CAPTURE_HEIGHT;
// Set label radius to 125 for PDF export (480x380px) to keep labels closer to center and prevent cut-off.
// If you change the chart size, adjust this value to be about 52% of the smallest dimension / 2.
const PDF_LABEL_RADIUS = 125;
const SCREEN_LABEL_RADIUS = 185; // For on-screen chart

// WARNING: If you change the chart size, you MUST update PDF_CONTAINER_WIDTH, PDF_CONTAINER_HEIGHT, and PDF_LABEL_RADIUS together!
// The PDF export depends on these being in sync to prevent label cutoff. See ResultsActions.tsx and chartCapture.ts for details.

interface RadarGroupArcsProps {
  groupSpans?: GroupSpan[] | null;
  // Injected by recharts' <Customized> via cloneElement - see recharts/component/Customized.
  angleAxisMap?: Record<string, unknown>;
  formattedGraphicalItems?: { props?: { points?: { angle?: number }[] } }[];
}

/**
 * Draws one arc per competency group just outside the outer ring.
 *
 * Reads the chart's real polar geometry (cx/cy/outerRadius/startAngle/endAngle) from
 * the angle axis rather than recomputing it, so the arcs scale with the chart at any
 * container size - including the narrower mobile layout and the fixed PDF size.
 * Bails out silently if the geometry is unavailable.
 */
const RadarGroupArcs = (props: RadarGroupArcsProps) => {
  const { groupSpans, angleAxisMap, formattedGraphicalItems } = props;
  if (!groupSpans || groupSpans.length === 0) return null;

  const axis = angleAxisMap ? (Object.values(angleAxisMap)[0] as Record<string, number> | undefined) : undefined;
  if (!axis) return null;

  const { cx, cy, outerRadius, startAngle, endAngle } = axis;
  const geometry = [cx, cy, outerRadius, startAngle, endAngle];
  if (!geometry.every(v => typeof v === 'number' && Number.isFinite(v))) return null;

  const count = Math.max(...groupSpans.map(s => s.endIndex)) + 1;
  if (count <= 0) return null;

  const step = (endAngle - startAngle) / count;
  if (!Number.isFinite(step) || step === 0) return null;

  // Prefer the vertex angles recharts actually rendered; fall back to even spacing.
  const points = formattedGraphicalItems?.[0]?.props?.points;
  const angleAt = (i: number): number => {
    const p = Array.isArray(points) ? points[i] : undefined;
    if (p && typeof p.angle === 'number' && Number.isFinite(p.angle)) return p.angle;
    return startAngle + i * step;
  };

  const arcRadius = outerRadius * (1 + RADAR_THEME.groupArc.radiusOffsetRatio);
  const halfGap = RADAR_THEME.groupArc.gapDegrees / 2;
  const dir = step < 0 ? -1 : 1;
  const sweepFlag = dir < 0 ? 1 : 0;

  return (
    <g className="radar-group-arcs" style={{ pointerEvents: 'none' }}>
      {groupSpans.map(span => {
        // Each category owns a band of +/- half a step around its vertex; the group
        // arc spans from the outer edge of its first member to that of its last.
        const arcStart = angleAt(span.startIndex) - step / 2 + dir * halfGap;
        const arcEnd = angleAt(span.endIndex) + step / 2 - dir * halfGap;
        const sweep = Math.abs(arcEnd - arcStart);
        if (!Number.isFinite(sweep) || sweep <= 0) return null;

        const p0 = polarPoint(cx, cy, arcRadius, arcStart);
        const p1 = polarPoint(cx, cy, arcRadius, arcEnd);
        const largeArc = sweep > 180 ? 1 : 0;

        return (
          <path
            key={span.key}
            d={`M ${p0.x} ${p0.y} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${p1.x} ${p1.y}`}
            fill="none"
            stroke={span.color}
            strokeWidth={RADAR_THEME.groupArc.strokeWidth}
            strokeLinecap={RADAR_THEME.groupArc.strokeLinecap}
          />
        );
      })}
    </g>
  );
};

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
    // Keys must match the category titles in utils/assessmentCategories.
    const longLabels: Record<string, string[]> = {
      'Strategy & Commercial': ['Strategy &', 'Commercial'],
      'Stakeholder Relationships': ['Stakeholder', 'Relationships'],
      'Execution & Operations': ['Execution &', 'Operations'],
      'Negotiation & Conflict Resolution': ['Negotiation &', 'Conflict Resolution'],
      'Delegation & Empowerment': ['Delegation &', 'Empowerment'],
      'Personal Effectiveness': ['Personal', 'Effectiveness']
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
          className="text-encourager"
          fontSize={isPDF ? "10" : "14"}
          fontWeight="500"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

// --- LEGEND -----------------------------------------------------------------
// Rendered as ONE inline SVG rather than flex rows. html2canvas re-implements
// layout itself and resolves flexbox cross-axis alignment differently from the
// browser, which left the swatches sitting off their labels in the captured PNG
// while looking perfect on screen. SVG has no layout to reinterpret: every mark
// and glyph is at an explicit coordinate, so it rasterises identically.

const LEGEND_FONT_FAMILY = 'Helvetica, Arial, sans-serif';
const LEGEND_FONT_WEIGHT = 500;
const LEGEND_TEXT_COLOR = '#64748b';
/**
 * Text baseline offset from an item's vertical centre, as a fraction of font size.
 * Deliberately a manual offset rather than dominant-baseline: html2canvas honours
 * explicit y coordinates reliably but handles dominant-baseline inconsistently -
 * which is the same class of bug we are fixing here.
 */
const LEGEND_BASELINE_RATIO = 0.34;

/** Reused across calls; creating a canvas per measurement is needless churn. */
let legendMeasureCanvas: HTMLCanvasElement | null = null;

/**
 * Measure a label in the exact font the SVG will render it in, so items can be
 * laid out at explicit x coordinates. Falls back to a rough estimate when no DOM
 * is available (the chart is client-only, so this is belt-and-braces).
 */
const measureLegendText = (text: string, fontSize: number): number => {
  if (typeof document === 'undefined') return text.length * fontSize * 0.55;
  if (!legendMeasureCanvas) legendMeasureCanvas = document.createElement('canvas');
  const ctx = legendMeasureCanvas.getContext('2d');
  if (!ctx) return text.length * fontSize * 0.55;
  ctx.font = `${LEGEND_FONT_WEIGHT} ${fontSize}px ${LEGEND_FONT_FAMILY}`;
  return ctx.measureText(text).width;
};

interface LegendMark {
  kind: 'swatch' | 'dash';
  label: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

interface RadarLegendProps {
  isPDF: boolean;
  /** Same guard as the group arcs - false for historical category orders. */
  showGroups: boolean;
}

const RadarLegend = ({ isPDF, showGroups }: RadarLegendProps) => {
  const swatchSize = 12;
  const dashWidth = 22;
  const markGap = 6;
  const rowHeight = isPDF ? 16 : 18;
  const rowGap = isPDF ? 8 : 12;
  const row1Font = isPDF ? 12 : 14;
  const row2Font = isPDF ? 11 : 13;
  const row1Spacing = isPDF ? 24 : 32;
  const row2Spacing = isPDF ? 16 : 20;

  const row1: LegendMark[] = [
    {
      kind: 'swatch',
      label: 'Current Level',
      fill: hexToRgba(RADAR_THEME.current.fill, RADAR_THEME.current.fillOpacity),
      stroke: RADAR_THEME.current.stroke,
      strokeWidth: 2,
    },
    { kind: 'dash', label: 'Desired Level' },
  ];
  const row2: LegendMark[] = RADAR_THEME.groups.map(group => ({
    kind: 'swatch',
    label: group.name,
    fill: group.color,
  }));

  const markWidth = (mark: LegendMark) => (mark.kind === 'dash' ? dashWidth : swatchSize);
  const itemWidth = (mark: LegendMark, font: number) =>
    markWidth(mark) + markGap + measureLegendText(mark.label, font);
  const rowWidth = (items: LegendMark[], font: number, spacing: number) =>
    items.reduce((sum, mark) => sum + itemWidth(mark, font), 0) +
    spacing * Math.max(0, items.length - 1);

  const row1Width = rowWidth(row1, row1Font, row1Spacing);
  const row2Width = showGroups ? rowWidth(row2, row2Font, row2Spacing) : 0;
  const svgWidth = Math.ceil(Math.max(row1Width, row2Width));
  const svgHeight = showGroups ? rowHeight * 2 + rowGap : rowHeight;

  const renderRow = (items: LegendMark[], font: number, spacing: number, width: number, rowIndex: number) => {
    const centreY = rowIndex * (rowHeight + rowGap) + rowHeight / 2;
    let x = (svgWidth - width) / 2; // centre the row within the SVG
    const nodes: JSX.Element[] = [];

    items.forEach((mark, i) => {
      if (mark.kind === 'swatch') {
        // Stroke straddles the path, so inset by half the stroke to keep the
        // painted swatch exactly swatchSize across.
        const inset = (mark.strokeWidth ?? 0) / 2;
        nodes.push(
          <rect
            key={`mark-${rowIndex}-${i}`}
            x={x + inset}
            y={centreY - swatchSize / 2 + inset}
            width={swatchSize - inset * 2}
            height={swatchSize - inset * 2}
            rx={2}
            fill={mark.fill}
            stroke={mark.stroke ?? 'none'}
            strokeWidth={mark.strokeWidth ?? 0}
          />
        );
      } else {
        nodes.push(
          <line
            key={`mark-${rowIndex}-${i}`}
            x1={x}
            y1={centreY}
            x2={x + dashWidth}
            y2={centreY}
            stroke={RADAR_THEME.desired.stroke}
            strokeWidth={RADAR_THEME.desired.strokeWidth}
            strokeDasharray={RADAR_THEME.desired.strokeDasharray}
          />
        );
      }

      nodes.push(
        <text
          key={`text-${rowIndex}-${i}`}
          x={x + markWidth(mark) + markGap}
          y={centreY + font * LEGEND_BASELINE_RATIO}
          fontFamily={LEGEND_FONT_FAMILY}
          fontSize={font}
          fontWeight={LEGEND_FONT_WEIGHT}
          fill={LEGEND_TEXT_COLOR}
        >
          {mark.label}
        </text>
      );

      x += itemWidth(mark, font) + spacing;
    });

    return nodes;
  };

  const description = showGroups
    ? `Current Level, Desired Level, and competency groups: ${RADAR_THEME.groups.map(g => g.name).join(', ')}`
    : 'Current Level and Desired Level';

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      // maxWidth/height:auto let the whole legend scale down proportionally on
      // narrow screens instead of overflowing. The PDF container is fixed and
      // wider than the legend, so no scaling happens there.
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={description}
    >
      {renderRow(row1, row1Font, row1Spacing, row1Width, 0)}
      {showGroups && renderRow(row2, row2Font, row2Spacing, row2Width, 1)}
    </svg>
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
          id: category.id || '',
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

  // Null for historical assessments stored in the old category order - see
  // resolveGroupSpans. Gates both the arcs and the group legend row.
  const groupSpans = useMemo(
    () => resolveGroupSpans(validChartData.map(d => d.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validChartData.map(d => d.id).join('|')]
  );
  

  

  
  if (validChartData.length === 0) {
    chartLogger.warn("No valid chart data to display");
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-encourager-background rounded-lg p-6 ${className}`}>
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
    ? { top: 60, right: 60, left: 60, bottom: 60 } // Reduced margins for PDF to make chart larger
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
              stroke={RADAR_THEME.current.stroke}
              fill={RADAR_THEME.current.fill}
              fillOpacity={RADAR_THEME.current.fillOpacity}
              strokeWidth={RADAR_THEME.current.strokeWidth}
              dot={{
                r: RADAR_THEME.current.dotRadius,
                fill: RADAR_THEME.current.stroke,
                // Explicit override - recharts otherwise leaks the Radar's own
                // fillOpacity onto the dots and washes them out.
                fillOpacity: RADAR_THEME.current.dotFillOpacity,
                stroke: RADAR_THEME.current.dotStroke,
                strokeWidth: RADAR_THEME.current.dotStrokeWidth,
                strokeOpacity: 1
              }}
            />
            <Radar
              name={isPDF ? "Desired State" : "Desired Level"}
              dataKey="desired"
              stroke={RADAR_THEME.desired.stroke}
              fill="none"
              fillOpacity={0}
              strokeWidth={RADAR_THEME.desired.strokeWidth}
              strokeDasharray={RADAR_THEME.desired.strokeDasharray}
              dot={false}
            />
            {/* Competency group arcs - suppressed for historical category orders. */}
            {groupSpans && <Customized component={<RadarGroupArcs groupSpans={groupSpans} />} />}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend area - PDF-friendly version */}
      <div 
        style={{ 
          gridArea: 'legend',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isPDF ? '8px' : '16px',
          minHeight: 'auto',
          height: 'auto',
          backgroundColor: 'white',
          padding: isPDF ? '12px' : '16px 16px 12px 16px',
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

        {/*
          Legend is a single inline SVG (see RadarLegend). It lives INSIDE
          [data-testid="radar-chart-container"] - the element chartCapture.ts
          photographs - so it appears in the PDF. Row 2 (groups) is gated on the
          same historical-order guard as the arcs.
        */}
        <RadarLegend isPDF={isPDF} showGroups={Boolean(groupSpans)} />
      </div>
    </div>
  );
};

export default SkillGapChart;
