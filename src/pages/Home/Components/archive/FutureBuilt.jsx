import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, displayHeading, colors } from '../../../themes.js'
import futureImage from '../../../assets/images/future.webp'

const PARAGRAPHS = [
  'The future is built on expertise, intelligence, and innovation.',
  'We are creating durable investment value through healthy, beautiful, and resilient real estate.',
  'This is the future, built.',
]

const MARK_ANCHOR = { x: 0.46, y: 0.18, color: colors.lightBlue }

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.white};

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    overflow: visible;
  }
`

const Layout = styled(Grid)`
  height: 100%;
  grid-template-rows: 100vh;

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-rows: none;
  }
`

const Left = styled(GridCell)`
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vh, 3rem);
  padding-block: clamp(2rem, 6vh, 4rem);
  z-index: 1;
`

const Paragraph = styled.p`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const Right = styled(GridCell)`
  position: relative;
  height: 100%;
  overflow: hidden;
  background-image: url(${futureImage});
  background-size: cover;
  background-position: center;
  width: calc(100% + ${GRID.PADDING}px);

  @media ${GRID.MEDIA_TABLET} {
    width: calc(100% + ${GRID.PADDING_TABLET}px);
  }

  @media ${GRID.MEDIA_MOBILE} {
    margin-left: -${GRID.PADDING_MOBILE}px;
    width: calc(100% + ${GRID.PADDING_MOBILE * 2}px);
    aspect-ratio: 3 / 4;
    height: auto;
  }
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

const Mark = styled.p`
  ${monoCallout}
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  color: ${colors.white};
  line-height: 1.2;
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
            const x = d.x + d.nudgeX + d.driftX
            const y = d.y + d.nudgeY + d.driftY
            el.style.left = `${x + padX}px`
            el.style.top = `${y + gap}px`
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
      <Layout>
        <Left $start={1} $span={6} $spanTablet={4}>
          {PARAGRAPHS.map((p) => (
            <Paragraph key={p}>{p}</Paragraph>
          ))}
        </Left>
        <Right $start={7} $span={6} $startTablet={5} $spanTablet={4}>
          <Field>
            <DotField
              ref={fieldRef}
              layout="scatter"
              layoutOptions={{ count: 20, anchors: [MARK_ANCHOR] }}
              count={21}
              dotColor={colors.lightBlue}
              dotDiameter={8}
              background={null}
              wander
              cursor
            />
          </Field>
          <Overlay>
            <Mark ref={markRef}>
              FUTURE
              <br />
              BUILT.
            </Mark>
          </Overlay>
        </Right>
      </Layout>
    </Section>
  )
}

export default FutureBuilt
