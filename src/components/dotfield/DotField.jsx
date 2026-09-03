import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styled from 'styled-components'
import { DotFieldEngine } from './dotFieldEngine.js'
import { densityScaleForViewport } from './viewport.js'
import ppRightSerifMono from '../../assets/fonts/PPRightSerifMono-Variable.woff2'

// The chart overlays draw text on a 2D canvas via native fillText, which only
// resolves a web font once it's fully loaded AND matched by its real family
// name. This is a variable woff2 whose internal name ("PP Right Serif Mono
// Variable") differs from the CSS @font-face alias, so referencing it by the
// alias silently falls back to a system font. p5's own loadFont() parses the
// file, registers the FontFace under its real name and waits for it to be
// ready, then hands back a p5.Font object we can pass straight to textFont().
// Shared across every DotField instance (one fetch/parse for the whole page).
let overlayFontPromise = null
function loadOverlayFont(p5Instance) {
  if (!overlayFontPromise) overlayFontPromise = p5Instance.loadFont(ppRightSerifMono).catch(() => null)
  return overlayFontPromise
}

// ─── DotField ────────────────────────────────────────────────────────────────
// Reusable p5.js dot field. Mount it anywhere and switch `layout` per stage to
// transition the dots between arrangements, or pass ordered `states` and scrub
// between them with the imperative seek(progress).
//
// Layouts (see layouts/index.js):
//   scatter, rings                                  — field arrangements
//   icon                                            — pixel-grid glyphs
//   barChart, simpleBars, heatmap, dotPlot,
//   scatterPlot, beeswarm, timeline                 — data visualisations
//
// Chart layouts also draw their axes/ticks/legends as a canvas overlay that
// cross-fades between states (see overlays.js). Every layout morphs into any
// other, so a scatter can gather into rings, become an icon, then a chart.
//
// Props:
//   layout        — layout name (trigger path)
//   layoutOptions — layout-specific options
//   states        — [{ layout, opts }] keyframes for the scrub path (seek())
//   count         — number of dots (structural; set at mount)
//   dotColor      — hex fill colour
//   dotDiameter   — base dot diameter in px (structural; set at mount)
//   background    — hex bg, or null/undefined for a transparent canvas
//   wander        — dots drift while idle (structural; set at mount)
//   cursor        — dots are nudged away from the cursor (structural; set at mount)
//   drift         — px amplitude of the idle "breathing" on parked dots (structural)
//   overlays      — draw chart overlays (default true)
//   seed          — fixed PRNG seed so two fields produce identical arrangements
//   responsive    — thin the dot count on small viewports (default true)

const Host = styled.div`
  width: 100%;
  height: 100%;

  canvas {
    display: block;
    touch-action: auto !important;
  }
`

function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function DotField(
  {
    layout = 'scatter',
    layoutOptions,
    states,
    count = 100,
    dotColor = '#212121',
    dotDiameter = 8,
    background = null,
    wander = true,
    cursor = true,
    drift = 2,
    seed,
    responsive = true,
    overlays = true,
  },
  ref,
) {
  const hostRef = useRef(null)
  const engineRef = useRef(null)
  const p5Ref = useRef(null)
  // Refs let draw() read the latest colours without re-mounting the sketch.
  const dotColorRef = useRef(dotColor)
  const backgroundRef = useRef(background)
  const overlaysRef = useRef(overlays)
  dotColorRef.current = dotColor
  backgroundRef.current = background
  overlaysRef.current = overlays

  // Mount the p5 sketch once. Structural props (count, dotDiameter, wander,
  // cursor) are read here and are not meant to change without a remount.
  useEffect(() => {
    const host = hostRef.current
    const engine = new DotFieldEngine({
      count,
      dotDiameter,
      wander,
      cursor,
      drift,
      layout,
      layoutOptions,
      states: states?.map((s) => ({ name: s.layout, opts: s.opts ?? {} })),
      seed,
      densityScale: responsive ? densityScaleForViewport(host.offsetWidth, host.offsetHeight) : 1,
    })
    engineRef.current = engine

    let instance
    let ro
    let io
    let cancelled = false

    // Cache parsed hex→rgb so per-dot anchor colours aren't re-parsed every frame.
    const rgbCache = new Map()
    const parseRgb = (hex) => {
      let c = rgbCache.get(hex)
      if (!c) {
        c = hexToRgb(hex)
        rgbCache.set(hex, c)
      }
      return c
    }

    const sketch = (p) => {
      p.setup = () => {
        p.pixelDensity(1)
        p.createCanvas(host.offsetWidth, host.offsetHeight)
        p.noStroke()
        engine.init(p, p.width, p.height)
      }

      p.draw = () => {
        const bg = backgroundRef.current
        if (bg == null) {
          p.clear()
        } else {
          const c = parseRgb(bg)
          p.background(c.r, c.g, c.b)
        }

        engine.update(p)

        // Overlays may leave a stroke set; dots are always stroke-free.
        p.noStroke()
        const base = parseRgb(dotColorRef.current)
        for (const d of engine.dots) {
          if (d.alpha <= 0 || d.diam <= 0) continue
          const c = d.color ? parseRgb(d.color) : base
          p.fill(c.r, c.g, c.b, d.alpha)
          p.circle(d.x + d.nudgeX + d.driftX, d.y + d.nudgeY + d.driftY, d.diam)
        }

        // Chart axes/labels sit on top of the dots and cross-fade between states.
        if (overlaysRef.current) engine.drawOverlays(p, base)
      }
    }

    // p5 is heavy (~900KB); load it off the critical path so the page renders
    // before the canvases hydrate.
    import('p5').then(({ default: p5 }) => {
      if (cancelled || !host) return
      instance = new p5(sketch, host)
      p5Ref.current = instance

      // Load the overlay font via p5 (parses the woff2, registers its real
      // family name, awaits document.fonts.ready) and hand the p5.Font to the
      // engine. The draw loop picks it up on the next frame once it resolves.
      loadOverlayFont(instance).then((font) => {
        if (font && !cancelled) engine.overlayFont = font
      })

      ro = new ResizeObserver((entries) => {
        const rect = entries[0].contentRect
        if (rect.width > 0 && rect.height > 0) {
          // Set the density first (bucketed, so it only changes on real steps)
          // so engine.resize() rebuilds the field at the new count in one pass.
          if (responsive) engine.densityScale = densityScaleForViewport(rect.width, rect.height)
          instance.resizeCanvas(rect.width, rect.height)
          engine.resize(instance, rect.width, rect.height)
        }
      })
      ro.observe(host)

      // Only run the draw loop while the field is on (or near) screen — keeps
      // off-screen sketches from animating hundreds of dots for nothing.
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) instance.loop()
          else instance.noLoop()
        },
        { rootMargin: '200px' },
      )
      io.observe(host)
    })

    return () => {
      cancelled = true
      io?.disconnect()
      ro?.disconnect()
      instance?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redeclare the scrub states whenever they change.
  useEffect(() => {
    const engine = engineRef.current
    if (engine && states) engine.setStates(states.map((s) => ({ name: s.layout, opts: s.opts ?? {} })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(states)])

  // Transition the field whenever the single-layout prop changes (trigger path).
  // Skipped when driving via `states` + imperative seek().
  useEffect(() => {
    if (states) return
    const engine = engineRef.current
    const p = p5Ref.current
    if (engine && p) engine.setLayout(p, layout, layoutOptions ?? {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, JSON.stringify(layoutOptions)])

  // Imperative scrub handle so a scroll driver can push progress every frame
  // without triggering a React re-render.
  useImperativeHandle(ref, () => ({
    seek(progress) {
      engineRef.current?.seek(progress)
    },
    setLayout(name, opts) {
      const engine = engineRef.current
      const p = p5Ref.current
      if (engine && p) engine.setLayout(p, name, opts ?? {})
    },
    getEngine: () => engineRef.current,
    // Resolved overlay geometry of the active chart layout (trigger path), for
    // aligning DOM annotations to the chart the field actually drew.
    getLayoutMeta: () => engineRef.current?.getLayoutMeta() ?? null,
  }))

  return <Host ref={hostRef} />
}

export default forwardRef(DotField)
