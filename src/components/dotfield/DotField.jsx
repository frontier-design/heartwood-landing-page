import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styled from 'styled-components'
import { DotFieldEngine } from './dotFieldEngine.js'
import { densityScaleForViewport } from './viewport.js'

// ─── DotField ────────────────────────────────────────────────────────────────
// Reusable p5.js dot field. Mount it anywhere and switch `layout` per stage to
// transition the dots between arrangements (ring, rings, cluster, scatter, grid).
//
// Props:
//   layout        — 'scatter' | 'ring' | 'rings' | 'cluster' | 'grid'
//   layoutOptions — layout-specific options (see layouts.js)
//   count         — number of dots (structural; set at mount)
//   dotColor      — hex fill colour
//   dotDiameter   — base dot diameter in px (structural; set at mount)
//   background    — hex bg, or null/undefined for a transparent canvas
//   wander        — dots drift while idle (structural; set at mount)
//   cursor        — dots are nudged away from the cursor (structural; set at mount)
//   drift         — px amplitude of the idle "breathing" on parked dots (structural)

const Host = styled.div`
  width: 100%;
  height: 100%;

  canvas {
    display: block;
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
  },
  ref,
) {
  const hostRef = useRef(null)
  const engineRef = useRef(null)
  const p5Ref = useRef(null)
  // Refs let draw() read the latest colours without re-mounting the sketch.
  const dotColorRef = useRef(dotColor)
  const backgroundRef = useRef(background)
  dotColorRef.current = dotColor
  backgroundRef.current = background

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

        const base = parseRgb(dotColorRef.current)
        for (const d of engine.dots) {
          if (d.alpha <= 0 || d.diam <= 0) continue
          const c = d.color ? parseRgb(d.color) : base
          p.fill(c.r, c.g, c.b, d.alpha)
          p.circle(d.x + d.nudgeX + d.driftX, d.y + d.nudgeY + d.driftY, d.diam)
        }
      }
    }

    // p5 is heavy (~900KB); load it off the critical path so the page renders
    // before the canvases hydrate.
    import('p5').then(({ default: p5 }) => {
      if (cancelled || !host) return
      instance = new p5(sketch, host)
      p5Ref.current = instance

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
  }))

  return <Host ref={hostRef} />
}

export default forwardRef(DotField)
