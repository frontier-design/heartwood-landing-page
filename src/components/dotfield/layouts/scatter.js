export function scatterLayout(count, w, h, opts = {}) {
  const random = opts.rand ?? Math.random
  const margin = opts.margin ?? 0.04
  const mx = w * margin
  const my = h * margin
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({ x: mx + random() * (w - mx * 2), y: my + random() * (h - my * 2) })
  }

  const offsetScale = opts.offsetRefWidth ? w / opts.offsetRefWidth : 1
  if (Array.isArray(opts.anchors)) {
    for (const a of opts.anchors) {
      positions.push({
        x: (a.x ?? 0) * w + (a.offsetX ?? 0) * offsetScale,
        y: (a.y ?? 0) * h + (a.offsetY ?? 0) * offsetScale,
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
