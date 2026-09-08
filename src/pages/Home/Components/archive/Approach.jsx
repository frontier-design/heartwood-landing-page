import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField, ringGeometry } from '../../../components/dotfield'
import { monoCallout, displayHeading, colors } from '../../../themes.js'

const RING_OPTIONS = {
  ringDotCounts: [800, 170, 170],
  stray: [1, 0.08, 0.08],
  minRadius: 0.1,
  radiusScale: 0.9,
  anchors: [
    { x: -0.01, y: -0.07, color: colors.teal },
    { x: -0.075, y: -0.02, color: colors.teal },
    { x: -0.03, y: 0.04, color: colors.teal },
  ],
}

const Section = styled.section`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background-color: ${colors.gray};
  padding-block: clamp(4rem, 10vh, 8rem);

  @media ${GRID.MEDIA_MOBILE} {
    min-height: auto;
  }
`

const Stage = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;

  @media ${GRID.MEDIA_MOBILE} {
    position: relative;
    inset: auto;
    width: 100%;
    aspect-ratio: 1 / 1;
    margin-top: clamp(2rem, 6vh, 4rem);
  }
`

const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const Content = styled(Grid)`
  position: relative;
  z-index: 1;
`

const HeadingCell = styled(GridCell)`
  @media (min-width: 1600px) {
    grid-column: 1 / span 5;
  }
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1.5rem, 3vh, 2.5rem);
  color: ${colors.teal};
  letter-spacing: 0.05em;
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const GraphOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`

const NodeLabel = styled.span`
  ${monoCallout}
  position: absolute;
  white-space: nowrap;
  color: ${colors.black};
  font-size: clamp(0.7rem, 0.85vw, 1rem);
`

const AxisLabel = styled.p`
  ${monoCallout}
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  text-align: center;
  line-height: 1.5;
  color: ${colors.black};
  font-weight: 350;
  font-size: clamp(0.7rem, 0.85vw, 1rem);
`

function Approach() {
  const fieldRef = useRef(null)
  const labelRefs = useRef([])
  const axisRefs = useRef([])

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
          const off = Math.min(engine.w, engine.h) * 0.012
          const padX = Math.min(engine.w, engine.h) * 0.008
          indices.current.forEach((di, i) => {
            const d = engine.dots[di]
            const el = labelRefs.current[i]
            if (d && el) {
              el.style.left = `${d.x + d.nudgeX + d.driftX + padX}px`
              el.style.top = `${d.y + d.nudgeY + d.driftY + off}px`
            }
          })
        }

        // Axis labels sit on the vertical centre line, one per gap between the
        // orbits (the last extends half a gap beyond the outer ring). Computed
        // from the real ring radii so they always land between the rings.
        const { cy, radii } = ringGeometry(engine.w, engine.h, RING_OPTIONS)
        const last = radii.length - 1
        radii.forEach((r, i) => {
          const el = axisRefs.current[i]
          if (!el) return
          const outer = i < last ? radii[i + 1] : r + (r - radii[i - 1])
          el.style.top = `${cy + (r + outer) / 2}px`
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Section>
      <Content>
        <HeadingCell $start={1} $span={6} $spanTablet={6}>
          <Eyebrow>A Resilient Approach</Eyebrow>
          <Heading>
            At our heart is the expertise of our people supported by responsive
            intelligence and systems-level real estate innovations.
          </Heading>
        </HeadingCell>
      </Content>
      <Stage>
        <Field>
          <DotField
            ref={fieldRef}
            layout="rings"
            layoutOptions={RING_OPTIONS}
            count={1140}
            dotColor={colors.lightBlue}
            dotDiameter={10}
            wander={false}
          />
        </Field>
        <GraphOverlay>
          <NodeLabel ref={(el) => (labelRefs.current[0] = el)}>EXPERTISE</NodeLabel>
          <NodeLabel ref={(el) => (labelRefs.current[1] = el)}>INTELLIGENCE</NodeLabel>
          <NodeLabel ref={(el) => (labelRefs.current[2] = el)}>INNOVATION</NodeLabel>
          <AxisLabel ref={(el) => (axisRefs.current[0] = el)}>
            HOW DO WE CREATE
            <br />
            INVESTMENT VALUE?
          </AxisLabel>
          <AxisLabel ref={(el) => (axisRefs.current[1] = el)}>RESILIENT REAL ESTATE</AxisLabel>
          <AxisLabel ref={(el) => (axisRefs.current[2] = el)}>PERFORMANCE</AxisLabel>
        </GraphOverlay>
      </Stage>
    </Section>
  )
}

export default Approach
