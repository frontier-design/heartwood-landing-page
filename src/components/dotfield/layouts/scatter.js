// Random scatter within an inset margin (fraction of each axis). Accepts a
// seeded `opts.rand` so the same field reproduces on resize (falls back to
// Math.random when called standalone).
//
// anchors — fixed accent points [{ x, y, color, diam }] where x/y are fractions
//   of the width/height (0..1), so they track the frame on resize. Appended as
//   coloured dots that participate in the field physics.
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

  return positions
}
