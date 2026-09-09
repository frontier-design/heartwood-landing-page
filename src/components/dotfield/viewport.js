const REF_AREA = 1440 * 900

export function densityScaleForViewport(w, h, opts = {}) {
  const min = opts.min ?? 0.35
  const max = opts.max ?? 1
  const refArea = opts.refArea ?? REF_AREA
  const area = Math.max(1, (w || 0) * (h || 0))
  if (area <= 1) return max

  let s = Math.sqrt(area / refArea)

  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) s *= 0.6
    if (window.matchMedia('(pointer: coarse)').matches) s *= 0.75
  }

  s = Math.min(max, Math.max(min, s))
  return Math.round(s * 10) / 10
}
