// Viewport-responsive dot density. The p5 field iterates every dot each frame,
// so a fixed count that looks right on a laptop overdraws on a phone. This maps
// the host's on-screen area to a count multiplier: fewer dots on small screens,
// coarse pointers, and when reduced motion is requested. The base `count` stays
// the ceiling (scale is capped at 1) so large screens never render more.

const REF_AREA = 1440 * 900 // scale ≈ 1 at a typical desktop canvas

// Bucketed to 0.1 steps so a continuous window drag doesn't rebuild the field on
// every pixel — the count only changes when the scale crosses a step.
export function densityScaleForViewport(w, h, opts = {}) {
  const min = opts.min ?? 0.35
  const max = opts.max ?? 1
  const refArea = opts.refArea ?? REF_AREA
  const area = Math.max(1, (w || 0) * (h || 0))
  if (area <= 1) return max

  // sqrt keeps the scale roughly linear against a screen dimension rather than
  // area, so it falls off gently instead of quadratically.
  let s = Math.sqrt(area / refArea)

  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) s *= 0.6
    if (window.matchMedia('(pointer: coarse)').matches) s *= 0.75
  }

  s = Math.min(max, Math.max(min, s))
  return Math.round(s * 10) / 10
}
