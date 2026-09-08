import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { DotField } from '../../../components/dotfield'
import { GRID, useMediaQuery } from '../../../grid'
import { monoCallout, colors } from '../../../themes.js'
import fullScreen1 from '../../../assets/images/full-screen-1.webp'

const CALLOUTS = [
  { lines: ['ALL-ELECTRIC', 'MECHANICAL SYSTEMS'], x: 0.246, y: 0.146, place: 'above' },
  { lines: ['PLAYGROUND AND', 'COMMUNITY GARDENS'], x: 0.661, xMobile: 0.5, y: 0.61, yMobile: 0.55, place: 'above' },
  { lines: ['COMMUNITY AND', 'CULTURAL SPACES'], x: 0.1225, y: 0.458, place: 'below' },
  { lines: ['WALKABLE ACCESS TO', 'EVERYDAY ESSENTIALS'], x: 0.831, xMobile: 0.55, y: 0.854, yMobile: 0.8, place: 'below' },
  {
    lines: ['2102 LAWRENCE AVENUE EAST, TORONTO, ON'],
    linesMobile: ['2102 LAWRENCE AVENUE EAST,', 'TORONTO, ON'],
    x: 0.1235,
    y: 0.9,
    place: 'below',
  },
]

const TRANSFORMS = {
  above: 'translateY(-100%)',
  below: 'none',
  right: 'translateY(-50%)',
}

const Section = styled.section`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background-image: url(${fullScreen1});
  background-size: cover;
  background-position: center;
`

const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`

const Callout = styled.p`
  ${monoCallout}
  position: absolute;
  margin: 0;
  white-space: nowrap;
  line-height: 1.4;
  color: ${colors.white};
  font-size: clamp(0.7rem, 0.85vw, 1rem);
  transform: ${(p) => TRANSFORMS[p.$place]};
`

function Development() {
  const fieldRef = useRef(null)
  const labelRefs = useRef([])
  const isMobile = useMediaQuery(GRID.MEDIA_MOBILE)
  const anchors = CALLOUTS.map((c) => ({
    x: isMobile ? c.xMobile ?? c.x : c.x,
    y: isMobile ? c.yMobile ?? c.y : c.y,
    color: colors.white,
  }))

  useEffect(() => {
    const indices = { current: null }
    let raf
    const tick = () => {
      const engine = fieldRef.current?.getEngine()
      if (engine?.dots.length) {
        if (!indices.current) {
          const found = []
          engine.dots.forEach((d, i) => d.color && found.push(i))
          if (found.length) indices.current = found
        }
        if (indices.current) {
          const gap = Math.min(engine.w, engine.h) * 0.014
          const padX = Math.min(engine.w, engine.h) * 0.008
          indices.current.forEach((di, i) => {
            const d = engine.dots[di]
            const el = labelRefs.current[i]
            if (!d || !el) return
            const x = d.x + d.nudgeX + d.driftX
            const y = d.y + d.nudgeY + d.driftY
            const place = CALLOUTS[i].place
            if (place === 'above') {
              el.style.left = `${x + padX}px`
              el.style.top = `${y - gap}px`
            } else if (place === 'below') {
              el.style.left = `${x + padX}px`
              el.style.top = `${y + gap}px`
            } else {
              el.style.left = `${x + gap}px`
              el.style.top = `${y}px`
            }
          })
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Section>
      <Field>
        <DotField
          ref={fieldRef}
          layout="scatter"
          layoutOptions={{ count: 0, anchors }}
          count={CALLOUTS.length}
          dotColor={colors.white}
          dotDiameter={12}
          wander={false}
        />
      </Field>
      <Overlay>
        {CALLOUTS.map((c, i) => {
          const lines = isMobile ? c.linesMobile ?? c.lines : c.lines
          return (
            <Callout key={c.lines[0]} $place={c.place} ref={(el) => (labelRefs.current[i] = el)}>
              {lines.map((line, j) => (
                <span key={line}>
                  {j > 0 && <br />}
                  {line}
                </span>
              ))}
            </Callout>
          )
        })}
      </Overlay>
    </Section>
  )
}

export default Development
