const TWO_PI = Math.PI * 2

// Per-ring density waves bias where dots gather around an orbit so they clump
// unevenly instead of spreading evenly.
function makeClumpWaves(random) {
  const n = 2 + Math.floor(random() * 4)
  const waves = []
  for (let i = 0; i < n; i++) {
    waves.push({
      freq: 1 + Math.floor(random() * 5),
      phase: random() * TWO_PI,
      amp: 0.15 + random() * 0.35,
    })
  }
  return waves
}

// Rejection-sample an angle weighted by the density waves. `amount` scales the
// clumping (0 = even spacing, 1 = full clumping).
function clumpedAngle(waves, amount, random) {
  if (amount <= 0 || waves.length === 0) return random() * TWO_PI
  for (let tries = 0; tries < 32; tries++) {
    const angle = random() * TWO_PI
    let density = 0.3
    for (const w of waves) {
      density += amount * w.amp * (0.5 + 0.5 * Math.sin(angle * w.freq + w.phase))
    }
    if (random() < density) return angle
  }
  return random() * TWO_PI
}

/**
 * Concentric orbits radiating from the centre — the main "ring logic".
 * Accepts a seeded `opts.rand` so the field reproduces on resize (falls back
 * to Math.random when called standalone).
 *
 * Options:
 *   ringDotCounts — array of dots per orbit, e.g. [40, 70, 110]. Its length is
 *                   the orbit count. When omitted, `count` is split across
 *                   `rings` orbits evenly.
 *   rings         — orbit count when ringDotCounts is not given (default 3)
 *   minRadius     — radius of the innermost orbit (default 14% of min axis).
 *                   A value <= 1 is read as a fraction of the min axis (stays
 *                   responsive); a larger value is treated as pixels.
 *   maxRadius     — radius of the outermost orbit (default 44% of min axis).
 *                   Same fraction/pixel rule as minRadius.
 *   radiusScale   — multiplier on min/maxRadius to shrink or grow the whole
 *                   graph while staying responsive (default 1)
 *   radii         — explicit array of orbit radii (overrides min/maxRadius)
 *   clump         — 0..1 angular clumping (default 0.4; 0 = even spacing)
 *   stray         — 0..1 fraction of dots scattered inside the orbit (default 0.12).
 *                   May be an array (per orbit) so e.g. the innermost ring fills
 *                   into a dense disc (stray 1) while the others stay as orbits.
 *   jitter        — radial noise in px (default 10% of each orbit's radius)
 *   anchors       — fixed accent points [{ x, y, color, diam }] where x/y are
 *                   offsets from centre as fractions of the min axis (so they
 *                   scale with the graph). Appended as coloured dots.
 *   cx, cy        — centre override
 */
/**
 * Resolve the shared geometry of a rings field (centre, min axis, and the
 * ordered orbit radii) from the same options ringsLayout uses. Exported so
 * callers can position annotations relative to the actual rings instead of
 * guessing — pass the identical opts and the field's pixel width/height.
 */
export function ringGeometry(w, h, opts = {}) {
  const cx = opts.cx ?? w / 2
  const cy = opts.cy ?? h / 2
  const radiusScale = opts.radiusScale ?? 1
  const axis = Math.min(w, h)
  const resolveRadius = (v, frac) => (v == null ? axis * frac : v <= 1 ? axis * v : v) * radiusScale
  const minRadius = resolveRadius(opts.minRadius, 0.14)
  const maxRadius = resolveRadius(opts.maxRadius, 0.44)

  const ringCount = Array.isArray(opts.ringDotCounts) && opts.ringDotCounts.length
    ? opts.ringDotCounts.length
    : Math.max(1, opts.rings ?? 3)

  const radii =
    opts.radii ??
    Array.from({ length: ringCount }, (_, i) =>
      ringCount <= 1 ? maxRadius : minRadius + (maxRadius - minRadius) * (i / (ringCount - 1)),
    )

  return { cx, cy, axis, minRadius, maxRadius, radii }
}

export function ringsLayout(count, w, h, opts = {}) {
  const random = opts.rand ?? Math.random
  const { cx, cy, axis, radii } = ringGeometry(w, h, opts)
  const clump = opts.clump ?? 0.4
  const strayOpt = opts.stray ?? 0.12

  let ringDotCounts = opts.ringDotCounts
  if (!Array.isArray(ringDotCounts) || ringDotCounts.length === 0) {
    const ringCount = radii.length
    const per = Math.round(count / ringCount)
    ringDotCounts = Array.from({ length: ringCount }, () => per)
  }
  const ringCount = ringDotCounts.length

  const positions = []
  for (let ring = 0; ring < ringCount; ring++) {
    const total = Math.max(0, Math.round(ringDotCounts[ring]))
    const ringR = radii[ring]
    const jitter = opts.jitter ?? ringR * 0.1
    const stray = Array.isArray(strayOpt) ? (strayOpt[ring] ?? 0) : strayOpt
    const waves = makeClumpWaves(random)
    for (let i = 0; i < total; i++) {
      if (random() < stray) {
        const a = random() * TWO_PI
        const r = Math.sqrt(random()) * ringR
        positions.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
      } else {
        const a = clumpedAngle(waves, clump, random)
        const r = ringR + (-jitter + random() * jitter * 2)
        positions.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
      }
    }
  }

  // Fixed accent points, offset from centre in fractions of the min axis so
  // they scale with the graph. Each carries its own colour/diameter.
  if (Array.isArray(opts.anchors)) {
    for (const a of opts.anchors) {
      positions.push({
        x: cx + (a.x ?? 0) * axis,
        y: cy + (a.y ?? 0) * axis,
        color: a.color,
        diam: a.diam,
      })
    }
  }

  return positions
}
