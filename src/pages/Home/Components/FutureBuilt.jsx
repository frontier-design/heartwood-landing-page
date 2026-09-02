import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, displayHeading, colors } from '../../../themes.js'
import futureImage from '../../../assets/images/biking.webp'

const PARAGRAPHS = [
  'We are creating durable investment value through healthy, beautiful, and resilient real estate.',
  'This is the future, built.',
]

const MARK_ANCHOR = { x: 0.78, y: 0.82, color: colors.lightBlue }

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  background-image: url(${futureImage});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    aspect-ratio: 3 / 4;
  }
`

const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const Layout = styled(Grid)`
  position: relative;
  height: 100%;
  z-index: 2;
  align-content: start;
  pointer-events: none;
`

const Left = styled(GridCell)`
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vh, 3rem);
  padding-top: clamp(2rem, 6vh, 4rem);
`

const Paragraph = styled.p`
  ${displayHeading}
  margin: 0;
  color: ${colors.white};
`

// Positioned per-frame onto its anchor dot (top-left corner rides the dot).
const Mark = styled.p`
  ${monoCallout}
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  line-height: 1.2;
  color: ${colors.white};
  z-index: 1;
  pointer-events: none;
`

function FutureBuilt() {
  const fieldRef = useRef(null)
  const markRef = useRef(null)

  useEffect(() => {
    let raf
    let markIndex = null
    const tick = () => {
      const engine = fieldRef.current?.getEngine()
      if (engine?.dots.length) {
        if (markIndex === null) {
          const i = engine.dots.findIndex((d) => d.color)
          if (i !== -1) markIndex = i
        }
        if (markIndex !== null) {
          const d = engine.dots[markIndex]
          const el = markRef.current
          if (d && el) {
            const gap = Math.min(engine.w, engine.h) * 0.014
            const padX = Math.min(engine.w, engine.h) * 0.008
            el.style.left = `${d.x + d.nudgeX + d.driftX + padX}px`
            el.style.top = `${d.y + d.nudgeY + d.driftY + gap}px`
          }
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
          layoutOptions={{ count: 40, anchors: [MARK_ANCHOR] }}
          count={41}
          dotColor={colors.lightBlue}
          dotDiameter={8}
          background={null}
          wander
          cursor
        />
      </Field>
      <Layout>
        <Left $start={1} $span={5} $spanTablet={6} $spanMobile={4}>
          {PARAGRAPHS.map((p) => (
            <Paragraph key={p}>{p}</Paragraph>
          ))}
        </Left>
      </Layout>
      <Mark ref={markRef}>
        FUTURE
        <br />
        BUILT.
      </Mark>
    </Section>
  )
}

export default FutureBuilt
