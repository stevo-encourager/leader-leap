/**
 * Radar chart theme and competency-group geometry.
 *
 * Lives in its own module (rather than in SkillGapChart.tsx) so the component
 * file exports only components - mixing constant and component exports trips
 * react-refresh/only-export-components and breaks Fast Refresh.
 *
 * The on-screen chart and the PDF export are the SAME component: chartCapture.ts
 * photographs the rendered DOM. Anything changed here affects both.
 */

/**
 * Dimensions of the element chartCapture.ts photographs in PDF mode - i.e. the
 * [data-testid="radar-chart-container"] box in SkillGapChart.
 *
 * ReactPDFDocument derives its embedded image height from PDF_CAPTURE_ASPECT rather
 * than hardcoding one, so changing the capture box can never again leave the PDF
 * embedding at a stale aspect ratio and squashing the chart.
 */
export const PDF_CAPTURE_WIDTH = 540;
export const PDF_CAPTURE_HEIGHT = 510;
/** height / width of the captured image. */
export const PDF_CAPTURE_ASPECT = PDF_CAPTURE_HEIGHT / PDF_CAPTURE_WIDTH;

export interface RadarGroup {
  key: string;
  name: string;
  color: string;
  /** Category IDs from utils/assessmentCategories. IDs are stable; titles are not. */
  categoryIds: string[];
}

/**
 * RADAR_THEME - single source of truth for radar chart styling.
 *
 * Every tunable visual value lives here so adjusting the design is a one-line edit
 * rather than a hunt through JSX.
 */
export const RADAR_THEME: {
  current: {
    fill: string;
    fillOpacity: number;
    stroke: string;
    strokeWidth: number;
    dotRadius: number;
    dotFillOpacity: number;
    dotStroke: string;
    dotStrokeWidth: number;
  };
  desired: { stroke: string; strokeWidth: number; strokeDasharray: string };
  groupArc: { strokeWidth: number; strokeLinecap: 'round' | 'butt' | 'square'; radiusOffsetRatio: number; gapDegrees: number };
  groups: RadarGroup[];
} = {
  current: {
    fill: '#2F5850',
    fillOpacity: 0.18,
    stroke: '#2F5850',
    strokeWidth: 2.5,
    dotRadius: 5,
    // MUST stay explicit: recharts spreads the Radar's own props (including the
    // 0.18 fillOpacity above) into every dot, and only keys set on the dot config
    // override them - see Radar.js renderDots. Without this the dots inherit the
    // polygon tint and render washed out.
    dotFillOpacity: 1,
    // White ring to lift the dots off the tint and grid. Set dotStrokeWidth to
    // 1.5 to enable; 0 leaves the dots as plain solid discs.
    dotStroke: '#FFFFFF',
    dotStrokeWidth: 0,
  },
  desired: {
    stroke: '#7FA08F',
    strokeWidth: 2,
    strokeDasharray: '6 4',
    // No fill by design - the desired ring is a dashed outline only.
  },
  groupArc: {
    strokeWidth: 7,
    // If html2canvas ever rasterises round caps badly, switch to 'butt' or 'square'.
    strokeLinecap: 'round',
    // Arc is drawn this fraction beyond the chart's outerRadius.
    // NOTE: on screen the axis labels sit at a FIXED radius (SCREEN_LABEL_RADIUS),
    // while outerRadius grows with the container - so raising this risks the arcs
    // colliding with the labels on wide desktop layouts. Lower it if that happens.
    radiusOffsetRatio: 0.06,
    // Angular gap left between adjacent group arcs, in degrees.
    gapDegrees: 6,
  },
  groups: [
    {
      key: 'leading-yourself',
      name: 'Leading yourself',
      color: '#C96736',
      categoryIds: ['self-leadership', 'emotional-intelligence', 'time-priority-management'],
    },
    {
      key: 'leading-a-team',
      name: 'Leading a team',
      color: '#6B8CAE',
      categoryIds: ['team-building', 'delegation-empowerment', 'negotiation-conflict-resolution'],
    },
    {
      key: 'beyond-the-team',
      name: 'Beyond the team',
      color: '#B08968',
      categoryIds: ['influencing'],
    },
    {
      key: 'leading-the-business',
      name: 'Leading the business',
      color: '#7D6B8F',
      categoryIds: ['strategic-thinking', 'decision-making', 'change-management'],
    },
  ],
};

/** Tint a hex colour for the legend swatch, driven by the same constants as the chart fill. */
export const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface GroupSpan extends RadarGroup {
  startIndex: number;
  endIndex: number;
}

/**
 * Work out the angular span of each group arc from the categories actually rendered.
 *
 * GUARD: historical assessments render in their stored (old) category order, where a
 * group's members are NOT contiguous. Drawing arcs across a non-contiguous run would
 * silently mis-label the chart, so this returns null - meaning no arcs and no group
 * legend - unless the full current 10-category contiguous order is present.
 *
 * Returns null when: the count differs, any rendered category has no ID, any rendered
 * category belongs to no group, any group is missing members, or any group's members
 * are non-adjacent in the rendered order.
 */
export const resolveGroupSpans = (ids: string[]): GroupSpan[] | null => {
  const expectedCount = RADAR_THEME.groups.reduce((n, g) => n + g.categoryIds.length, 0);
  if (ids.length !== expectedCount) return null;
  if (ids.some(id => !id)) return null;

  const known = new Set(RADAR_THEME.groups.flatMap(g => g.categoryIds));
  if (ids.some(id => !known.has(id))) return null;

  const spans: GroupSpan[] = [];
  for (const group of RADAR_THEME.groups) {
    const indices: number[] = [];
    ids.forEach((id, i) => {
      if (group.categoryIds.includes(id)) indices.push(i);
    });
    if (indices.length !== group.categoryIds.length) return null;
    for (let k = 1; k < indices.length; k += 1) {
      if (indices[k] !== indices[k - 1] + 1) return null;
    }
    spans.push({ ...group, startIndex: indices[0], endIndex: indices[indices.length - 1] });
  }
  return spans;
};

const RADIAN = Math.PI / 180;

/** Mirrors recharts' own polarToCartesian (util/PolarUtils) so arcs land on the chart's geometry. */
export const polarPoint = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius,
});
