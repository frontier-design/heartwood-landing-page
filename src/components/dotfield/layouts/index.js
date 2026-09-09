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
