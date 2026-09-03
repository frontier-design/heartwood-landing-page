// ─── Chart overlays ──────────────────────────────────────────────────────────
// Labels, axes, ticks and legends drawn on top of the dots for the chart
// layouts (ported from heartwood-tools/js/datavis/chart-overlays.js). Each
// renderer takes the `layout` metadata its chart layout emitted:
//
//   render(p, layout, fadeT, rgb, w, h)
//     p      — p5 instance
//     layout — geometry/labels from the layout generator (see layouts/charts.js)
//     fadeT  — 0..1 fade multiplier (the engine cross-fades overlays)
//     rgb    — { r, g, b } fallback text colour (the field's dot colour)
//     w, h   — canvas size
//
// Per-layout text options: `font` (CSS family list), `fontSize` (px),
// `textColor` (hex; defaults to the dot colour).

export const OVERLAY_FONT = "'PP Right Serif Mono', monospace"
export const OVERLAY_FADE_MS = 500

const rgbCache = new Map()
function hexToRgb(hex) {
  let c = rgbCache.get(hex)
  if (c) return c
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  c = { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
  rgbCache.set(hex, c)
  return c
}

// Common setup: resolve colour, set the font, return helpers bound to fadeT.
function begin(p, layout, fadeT, rgb) {
  const c = layout.textColor ? hexToRgb(layout.textColor) : rgb
  const size = layout.fontSize ?? 11
  p.textFont(layout.font ?? OVERLAY_FONT)
  p.textSize(size)
  p.noStroke()
  return {
    c,
    size,
    fill: (a = 255) => p.fill(c.r, c.g, c.b, a * fadeT),
    stroke: (a = 255) => { p.stroke(c.r, c.g, c.b, a * fadeT) },
  }
}

function multiline(p, text, x, y, lineStep) {
  const lines = String(text).split('\n')
  for (let i = 0; i < lines.length; i++) p.text(lines[i], x, y + i * lineStep)
}

function drawBarChart(p, layout, fadeT, rgb) {
  const b = layout
  const { c, size, fill, stroke } = begin(p, layout, fadeT, rgb)
  const legDot = 10
  const legTextGap = 8
  const legRowStep = legDot + 5
  const legendAbovePad = 32

  // Legend (full + dim swatches) above the bars.
  const legLeft = b.ox - b.diam / 2
  const dotCx = legLeft + legDot / 2
  const textX = legLeft + legDot + legTextGap
  const legRow1Y = b.oy - legendAbovePad - legRowStep
  const legRow2Y = b.oy - legendAbovePad
  p.textAlign(p.LEFT, p.CENTER)
  fill(255)
  p.circle(dotCx, legRow1Y, legDot)
  p.text(b.legend[0], textX, legRow1Y)
  fill(b.dimAlpha)
  p.circle(dotCx, legRow2Y, legDot)
  fill(255)
  p.text(b.legend[1], textX, legRow2Y)

  // Y ticks with faint gridlines.
  const axisLeft = b.ox - b.diam / 2
  const axisRight = b.ox + b.gridW + b.diam / 2
  const yAxisPad = 14
  const pxPerUnit = b.gridH / (b.yMax - b.yMin)
  p.textAlign(p.RIGHT, p.CENTER)
  for (const tick of b.yTicks) {
    const yy = b.baseY - (tick - b.yMin) * pxPerUnit
    stroke(40)
    p.strokeWeight(1)
    p.line(axisLeft, yy, axisRight, yy)
    p.noStroke()
    fill(255)
    p.text(String(tick), axisLeft - yAxisPad, yy)
  }

  // Rotated y-axis label.
  p.push()
  p.translate(axisLeft - yAxisPad - 36, b.baseY - b.gridH / 2)
  p.rotate(-p.HALF_PI)
  p.textAlign(p.CENTER, p.CENTER)
  p.fill(c.r, c.g, c.b, 255 * fadeT)
  p.text(b.yLabel, 0, 0)
  p.pop()

  // Bar labels below the baseline.
  fill(255)
  p.noStroke()
  p.textAlign(p.CENTER, p.TOP)
  for (let i = 0; i < b.cols; i++) multiline(p, b.colLabels[i], b.barCenters[i], b.baseY + 22, size + 4)
}

function drawSimpleBars(p, layout, fadeT, rgb) {
  const sb = layout
  const { fill } = begin(p, layout, fadeT, rgb)
  const legDot = 12
  const legTextGap = 10
  const legRowStep = legDot + 6
  const legPad = 28
  const legLeft = sb.ox - sb.diam / 2
  const dotCx = legLeft + legDot / 2
  const textX = legLeft + legDot + legTextGap
  const leg1Y = sb.oy - sb.diam / 2 - legPad - legRowStep
  const leg2Y = sb.oy - sb.diam / 2 - legPad

  p.textAlign(p.LEFT, p.CENTER)
  fill(255)
  p.circle(dotCx, leg1Y, legDot)
  p.text(sb.legend[0], textX, leg1Y)
  fill(sb.dimAlpha)
  p.circle(dotCx, leg2Y, legDot)
  fill(255)
  p.text(sb.legend[1], textX, leg2Y)

  p.textAlign(p.CENTER, p.TOP)
  for (let i = 0; i < sb.cols; i++) {
    if (sb.colLabels[i]) p.text(sb.colLabels[i], sb.ox + i * sb.spacing, sb.oy + sb.gridH + 22)
  }
}

function drawHeatmap(p, layout, fadeT, rgb) {
  const g = layout
  const { fill } = begin(p, layout, fadeT, rgb)
  const labelPad = 8

  // Row labels (days) on the left.
  p.textAlign(p.RIGHT, p.CENTER)
  fill(255)
  for (let r = 0; r < g.rows; r++) {
    const label = g.rowLabels[r]
    if (label) p.text(label, g.ox - g.diam - labelPad, g.oy + r * g.spacing)
  }

  // Column labels (months) spread evenly across the columns.
  const n = g.colLabels.length
  const colsPer = g.cols / n
  p.textAlign(p.LEFT, p.BOTTOM)
  for (let i = 0; i < n; i++) {
    const col = Math.round(i * colsPer)
    if (col < g.cols && g.colLabels[i]) p.text(g.colLabels[i], g.ox + col * g.spacing - 2, g.oy - g.diam - labelPad)
  }

  // Less ●●●●● More legend, right-aligned under the grid.
  const legendY = g.oy + g.gridH + g.diam * 2.5 + labelPad
  const legendDot = 10
  const legendGap = legendDot + 3
  let hx = g.ox + g.gridW + g.diam / 2
  p.textAlign(p.RIGHT, p.CENTER)
  fill(255)
  p.text(g.legend[1], hx, legendY)
  hx -= p.textWidth(g.legend[1]) + 10 + legendDot / 2
  for (let i = g.levels.length - 1; i >= 0; i--) {
    fill(g.levels[i])
    p.circle(hx, legendY, legendDot)
    hx -= legendGap
  }
  hx -= legendDot / 2 + 10
  fill(255)
  p.text(g.legend[0], hx, legendY)
}

function drawDotPlot(p, layout, fadeT, rgb) {
  const dp = layout
  const { fill } = begin(p, layout, fadeT, rgb)

  // Category labels.
  p.textAlign(p.RIGHT, p.CENTER)
  fill(255)
  for (let i = 0; i < dp.categories.length; i++) {
    p.text(dp.categories[i].label, dp.ox - dp.diam - 10, dp.oy + i * dp.rowHeight)
  }

  // X ticks and axis label.
  const tickY = dp.oy + dp.chartH + 16
  p.textAlign(p.CENTER, p.TOP)
  for (const tick of dp.xTicks) {
    const tx = dp.ox + ((tick - dp.xMin) / (dp.xMax - dp.xMin)) * dp.chartW
    p.text(String(tick), tx, tickY)
  }
  p.text(dp.xLabel, dp.ox + dp.chartW / 2, tickY + 18)

  // Legend: dim = before, full = after.
  const legDot = 10
  const legGap = 8
  const legRowStep = legDot + 5
  const legY1 = dp.oy - 30 - legRowStep
  const legY2 = dp.oy - 30
  p.textAlign(p.LEFT, p.CENTER)
  fill(100)
  p.circle(dp.ox + legDot / 2, legY1, legDot)
  fill(255)
  p.text(dp.legend[0], dp.ox + legDot + legGap, legY1)
  p.circle(dp.ox + legDot / 2, legY2, legDot)
  p.text(dp.legend[1], dp.ox + legDot + legGap, legY2)
}

function drawAxes(p, layout, stroke) {
  const axY = layout.oy + layout.chartH
  stroke(Math.round(255 * 0.68))
  p.strokeWeight(1)
  p.line(layout.ox, axY, layout.ox + layout.chartW, axY)
  p.line(layout.ox, layout.oy, layout.ox, axY)
  p.noStroke()
}

function drawScatterPlot(p, layout, fadeT, rgb) {
  const sc = layout
  const { c, fill, stroke } = begin(p, layout, fadeT, rgb)
  drawAxes(p, sc, stroke)

  fill(255)
  p.textAlign(p.CENTER, p.TOP)
  for (const xv of sc.xTicks) {
    const sx = sc.ox + ((xv - sc.xMin) / (sc.xMax - sc.xMin)) * sc.chartW
    p.text(sc.formatX(xv), sx, sc.oy + sc.chartH + 14)
  }
  p.text(sc.xLabel, sc.ox + sc.chartW / 2, sc.oy + sc.chartH + 44)

  p.textAlign(p.RIGHT, p.CENTER)
  for (const yv of sc.yTicks) {
    const hy = sc.oy + (1 - (yv - sc.yMin) / (sc.yMax - sc.yMin)) * sc.chartH
    p.text(sc.formatY(yv), sc.ox - 14, hy)
  }

  p.push()
  p.translate(sc.ox - (sc.yLabelPad ?? 48), sc.oy + sc.chartH / 2)
  p.rotate(-p.HALF_PI)
  p.textAlign(p.CENTER, p.CENTER)
  p.fill(c.r, c.g, c.b, 255 * fadeT)
  p.text(sc.yLabel, 0, 0)
  p.pop()

  // Small muted disclaimer centred under the x-axis label.
  if (sc.subtitle) {
    const base = sc.fontSize ?? 11
    p.textSize(Math.max(10, base * 0.74))
    p.textAlign(p.CENTER, p.TOP)
    p.fill(140, 140, 140, 255 * fadeT)
    p.text(sc.subtitle, sc.ox + sc.chartW / 2, sc.oy + sc.chartH + 44 + base + 8)
  }
}

function drawBeeswarm(p, layout, fadeT, rgb) {
  const bw = layout
  const { fill, stroke } = begin(p, layout, fadeT, rgb)
  drawAxes(p, bw, stroke)

  fill(255)
  p.textAlign(p.CENTER, p.TOP)
  for (let i = 0; i < bw.colCenters.length; i++) p.text(bw.groupLabels[i], bw.colCenters[i], bw.oy + bw.chartH + 14)

  p.textAlign(p.RIGHT, p.CENTER)
  for (const yv of bw.yTicks) {
    const hy = bw.oy + (1 - (yv - bw.yMin) / (bw.yMax - bw.yMin)) * bw.chartH
    p.text(String(yv), bw.ox - 14, hy)
  }
}

function drawTimeline(p, layout, fadeT, rgb) {
  const { size, fill } = begin(p, layout, fadeT, rgb)
  fill(255)
  p.textAlign(p.CENTER, p.TOP)
  for (const m of layout.milestones) multiline(p, m.label, m.x, m.y, size + 3)
}

// Corner legend for a plain scatter field: "TITLE / total" bottom-left and
// "1 DOT = value UNIT" bottom-right (stacked on narrow canvases).
function drawScatterLegend(p, layout, fadeT, rgb, w, h) {
  if (w == null || h == null) return
  const { size, fill } = begin(p, { fontSize: 12, ...layout }, fadeT, rgb)
  const pad = layout.pad ?? 24
  const lineHeight = size + 4
  const stackGap = 12
  const title = (layout.title ?? '').toUpperCase()
  const total = Math.max(0, Number(layout.total) || 0).toLocaleString('en-US')
  const unit = (layout.unit ?? '').toUpperCase()
  const value = Math.max(1, Math.round(Number(layout.dotValue) || 1)).toLocaleString('en-US')
  const right = unit ? `1 DOT = ${value} ${unit}` : `1 DOT = ${value}`
  const bottomY = h - pad
  const wantTotal = layout.showTotal !== false
  const wantUnit = layout.showUnit !== false
  fill(255)

  if (w < 500) {
    p.textAlign(p.LEFT, p.BOTTOM)
    let y = bottomY
    if (wantUnit) {
      p.text(right, pad, y)
      y -= lineHeight + (wantTotal ? stackGap : 0)
    }
    if (wantTotal) {
      p.text(total, pad, y)
      p.text(title, pad, y - lineHeight)
    }
  } else {
    if (wantTotal) {
      p.textAlign(p.LEFT, p.BOTTOM)
      p.text(total, pad, bottomY)
      p.text(title, pad, bottomY - lineHeight)
    }
    if (wantUnit) {
      p.textAlign(p.RIGHT, p.BOTTOM)
      p.text(right, w - pad, bottomY)
    }
  }
}

export const overlayRenderers = {
  barChart: drawBarChart,
  simpleBars: drawSimpleBars,
  heatmap: drawHeatmap,
  dotPlot: drawDotPlot,
  scatterPlot: drawScatterPlot,
  beeswarm: drawBeeswarm,
  timeline: drawTimeline,
  scatterLegend: drawScatterLegend,
}

export default overlayRenderers
