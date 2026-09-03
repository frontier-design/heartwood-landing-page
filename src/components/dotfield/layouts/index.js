// ─── Dot Field Layouts ───────────────────────────────────────────────────────
// Pure position generators, one module per family. Each takes
// (count, w, h, opts) and returns either:
//
//   [{ x, y, alpha?, diam?, color? }]          — target positions, or
//   { positions, layout }                       — positions plus overlay
//                                                 metadata (charts: axes,
//                                                 ticks, legends — see
//                                                 ../overlays.js)
//
// The DotFieldEngine tweens dots toward these, so any layout morphs into any
// other: scatter → rings → a pixel icon → a bar chart and back. A single ring
// is just `rings` with one orbit (rings: 1, or ringDotCounts of length 1).

import { scatterLayout } from './scatter.js'
import { ringsLayout, ringGeometry } from './rings.js'
import { iconLayout, iconGeometry, resolveIconCells, iconPresets, ICON_GRID_SIZE } from './icons.js'
import {
  chartLayouts,
  chartPresets,
  barChartLayout,
  simpleBarsLayout,
  heatmapLayout,
  dotPlotLayout,
  scatterPlotLayout,
  beeswarmLayout,
  timelineLayout,
} from './charts.js'

export {
  scatterLayout,
  ringsLayout,
  ringGeometry,
  iconLayout,
  iconGeometry,
  resolveIconCells,
  iconPresets,
  ICON_GRID_SIZE,
  chartLayouts,
  chartPresets,
  barChartLayout,
  simpleBarsLayout,
  heatmapLayout,
  dotPlotLayout,
  scatterPlotLayout,
  beeswarmLayout,
  timelineLayout,
}

export const layouts = {
  scatter: scatterLayout,
  rings: ringsLayout,
  icon: iconLayout,
  ...chartLayouts,
}

export default layouts
