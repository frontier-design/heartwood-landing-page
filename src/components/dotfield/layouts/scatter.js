// Random scatter within an inset margin (fraction of each axis). Accepts a
// seeded `opts.rand` so the same field reproduces on resize (falls back to
// Math.random when called standalone).
//
// anchors — fixed accent points [{ x, y, color, diam }] where x/y are fractions
//   of the width/height (0..1), so they track the frame on resize. Appended as
//   coloured dots that participate in the field physics.
// legend  — optional corner legend { title, total, unit, dotValue, showTotal,
//   showUnit } drawn by the `scatterLegend` overlay ("TITLE / total" bottom-left,
//   "1 DOT = value UNIT" bottom-right). Omit for a plain field.
export function scatterLayout(count, w, h, opts = {}) {
  const random = opts.rand ?? Math.random
  const margin = opts.margin ?? 0.04
  const mx = w * margin
  const my = h * margin
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({ x: mx + random() * (w - mx * 2), y: my + random() * (h - my * 2) })
  }

  if (Array.isArray(opts.anchors)) {
    for (const a of opts.anchors) {
      positions.push({
        x: (a.x ?? 0) * w,
        y: (a.y ?? 0) * h,
        color: a.color,
        diam: a.diam,
      })
    }
  }

  if (opts.legend) {
    const layout = { overlay: 'scatterLegend', ...opts.legend }
    if (opts.font) layout.font = opts.font
    if (opts.fontSize) layout.fontSize = opts.fontSize
    if (opts.textColor) layout.textColor = opts.textColor
    return { positions, layout }
  }

  return positions
}
