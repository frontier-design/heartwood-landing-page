import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField, ringGeometry } from '../../../components/dotfield'
import { monoCallout, displayHeading, colors } from '../../../themes.js'
import intelligenceImage from '../../../assets/images/other-web/intelligence.webp'

// Four concentric rings. The innermost (700 dots, stray 1) fills a dense disc —
// the "BETTER DECISIONS" core — while the outer three stay as orbits that carry
// the data labels.
const RING_OPTIONS = {
  ringDotCounts: [700, 220, 220, 220],
  stray: [1, 0.06, 0.06, 0.22],
  minRadius: 0.07,
  maxRadius: 0.52,
}
const COUNT = RING_OPTIONS.ringDotCounts.reduce((a, b) => a + b, 0)
const LABELS = ['ADVANCED\nANALYTICS', 'STRUCTURED DATA', 'UNSTRUCTURED DATA']

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100svh;
  background-color: ${colors.gray};
  overflow: clip;

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
  }
`

const Layout = styled(Grid)`
  position: relative;
  height: 100%;
`

const Left = styled(GridCell)`
  display: flex;
  flex-direction: column;
  padding-top: clamp(4rem, 12vh, 9rem);
  padding-bottom: clamp(2rem, 6vh, 4rem);

  @media ${GRID.MEDIA_MOBILE} {
    padding-top: clamp(1.5rem, 5vh, 2.5rem);
    padding-bottom: clamp(1.5rem, 4vh, 3rem);
  }
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1rem, 2.5vh, 1.75rem);
  color: ${colors.teal};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const Right = styled(GridCell)`
  position: relative;
  height: 100%;
`

// The graph bleeds off the right edge: extend the stage past the cell by the
// grid padding so the image/rings reach the viewport edge (Section clips it).
const Stage = styled.div`
  position: relative;
  height: 100%;
  width: calc(100% + ${GRID.PADDING}px);
  background-image: url(${intelligenceImage});
  background-size: cover;
  background-position: center;
  overflow: clip;

  @media ${GRID.MEDIA_TABLET} {
    width: calc(100% + ${GRID.PADDING_TABLET}px);
  }

  @media ${GRID.MEDIA_MOBILE} {
    width: calc(100% + ${GRID.PADDING_MOBILE * 2}px);
    margin-left: -${GRID.PADDING_MOBILE}px;
    height: auto;
    aspect-ratio: 3 / 4;
  }
`

const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

// Labels sit above the canvas; positioned per-frame from the live ring geometry
// so they stay centred on each orbit as the field resizes.
const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`

const Label = styled.span`
  ${monoCallout}
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.35;
  white-space: pre-line;
  color: ${(p) => (p.$core ? colors.black : colors.white)};
`

function Intelligence() {
  const fieldRef = useRef(null)
  const labelRefs = useRef([])
  const centerRef = useRef(null)

  // Keep the labels pinned to the rings: read the engine's resolved geometry
  // each frame and place each label at the midpoint between its two orbits.
  useEffect(() => {
    let raf
    const tick = () => {
      const engine = fieldRef.current?.getEngine()
      if (engine?.dots.length) {
        const { cx, cy, radii } = ringGeometry(engine.w, engine.h, RING_OPTIONS)
        labelRefs.current.forEach((el, i) => {
          if (!el) return
          el.style.left = `${cx}px`
          el.style.top = `${cy - (radii[i] + radii[i + 1]) / 2}px`
        })
        if (centerRef.current) {
          centerRef.current.style.left = `${cx}px`
          centerRef.current.style.top = `${cy}px`
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
        <Left $start={1} $span={5} $spanTablet={4} $spanMobile={4}>
          <Eyebrow>INTELLIGENCE</Eyebrow>
          <Heading>
            Real-time advanced analytics capabilities give our team the clarity
            and conviction to make smarter decisions and drive returns.
          </Heading>
        </Left>
        <Right $start={6} $span={7} $startTablet={5} $spanTablet={4} $spanMobile={4}>
          <Stage>
            <Field>
              <DotField
                ref={fieldRef}
                layout="rings"
                layoutOptions={RING_OPTIONS}
                count={COUNT}
                dotColor={colors.lightBlue}
                dotDiameter={11}
                wander={false}
              />
            </Field>
            <Overlay>
              {LABELS.map((label, i) => (
                <Label key={label} ref={(el) => (labelRefs.current[i] = el)}>
                  {label}
                </Label>
              ))}
              <Label ref={centerRef} $core>{'BETTER\nDECISIONS'}</Label>
            </Overlay>
          </Stage>
        </Right>
      </Layout>
    </Section>
  )
}

export default Intelligence
