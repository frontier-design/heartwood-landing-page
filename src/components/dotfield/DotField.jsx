import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styled from 'styled-components'
import { DotFieldEngine } from './dotFieldEngine.js'
import { densityScaleForViewport } from './viewport.js'
import ppRightSerifMono from '../../assets/fonts/PPRightSerifMono-Variable.woff2'

let overlayFontPromise = null
function loadOverlayFont(p5Instance) {
  if (!overlayFontPromise) overlayFontPromise = p5Instance.loadFont(ppRightSerifMono).catch(() => null)
  return overlayFontPromise
}

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

  const dotColorRef = useRef(dotColor)
  const backgroundRef = useRef(background)
  const overlaysRef = useRef(overlays)
  dotColorRef.current = dotColor
  backgroundRef.current = background
  overlaysRef.current = overlays

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

        p.noStroke()
        const base = parseRgb(dotColorRef.current)
        for (const d of engine.dots) {
          if (d.alpha <= 0 || d.diam <= 0) continue
          const c = d.color ? parseRgb(d.color) : base
          p.fill(c.r, c.g, c.b, d.alpha)
          p.circle(d.x + d.nudgeX + d.driftX, d.y + d.nudgeY + d.driftY, d.diam)
        }

        if (overlaysRef.current) engine.drawOverlays(p, base)
      }
    }

    import('p5').then(({ default: p5 }) => {
      if (cancelled || !host) return
      instance = new p5(sketch, host)
      p5Ref.current = instance

      loadOverlayFont(instance).then((font) => {
        if (font && !cancelled) engine.overlayFont = font
      })

      ro = new ResizeObserver((entries) => {
        const rect = entries[0].contentRect
        if (rect.width > 0 && rect.height > 0) {

          if (responsive) engine.densityScale = densityScaleForViewport(rect.width, rect.height)
          instance.resizeCanvas(rect.width, rect.height)
          engine.resize(instance, rect.width, rect.height)
        }
      })
      ro.observe(host)

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

  }, [])

  useEffect(() => {
    const engine = engineRef.current
    if (engine && states) engine.setStates(states.map((s) => ({ name: s.layout, opts: s.opts ?? {} })))

  }, [JSON.stringify(states)])

  useEffect(() => {
    if (states) return
    const engine = engineRef.current
    const p = p5Ref.current
    if (engine && p) engine.setLayout(p, layout, layoutOptions ?? {})

  }, [layout, JSON.stringify(layoutOptions)])

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

    getLayoutMeta: () => engineRef.current?.getLayoutMeta() ?? null,
  }))

  return <Host ref={hostRef} />
}

export default forwardRef(DotField)
