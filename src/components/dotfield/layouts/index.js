// ─── Dot Field Layouts ───────────────────────────────────────────────────────
// Pure position generators, one file per layout. Each takes (count, w, h, opts)
// and returns an array of target positions [{ x, y }] in pixel space. The
// DotFieldEngine tweens dots toward these, so scatter transitions into rings and
// back — the shared "ring logic" reused across the site's stages. A single ring
// is just `rings` with one orbit (rings: 1, or ringDotCounts of length 1).

import { scatterLayout } from './scatter.js'
import { ringsLayout, ringGeometry } from './rings.js'

export { scatterLayout, ringsLayout, ringGeometry }

export const layouts = {
  scatter: scatterLayout,
  rings: ringsLayout,
}

export default layouts
