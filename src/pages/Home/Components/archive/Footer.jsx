import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, colors } from '../../../themes.js'
import Wordmark from '../../../assets/images/Heartwood-Wordmark.svg'

const MARK_ANCHOR = { x: 0.28, y: -0.24, color: colors.teal }

const RING_OPTIONS = {
  ringDotCounts: [90, 150, 210, 300],
  stray: 0.4,
  minRadius: 0.09,
  maxRadius: 0.5,
  anchors: [MARK_ANCHOR],
}
const RING_COUNT = RING_OPTIONS.ringDotCounts.reduce((a, b) => a + b, 0) + RING_OPTIONS.anchors.length

const FOOTER_LINKS = ['Terms', 'Land Acknowledgement', 'Socials']

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.black};
  display: flex;
  flex-direction: column;

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    min-height: 100vh;
  }
`

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const TopBar = styled(Grid)`
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding-top: clamp(1.5rem, 3vh, 3rem);
  align-items: start;
`

const Contact = styled(GridCell)`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vh, 1.5rem);
`

const Line = styled.p`
  ${monoCallout}
  margin: 0;
  color: ${colors.white};
`

const LinksCell = styled(GridCell)`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: clamp(1.5rem, 3vw, 3rem);

  @media ${GRID.MEDIA_MOBILE} {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.4rem, 1.2vh, 0.75rem);
    margin-top: clamp(1rem, 3vh, 2rem);
  }
`

const FooterLink = styled.a`
  ${monoCallout}
  color: ${colors.white};
  text-decoration: none;
  white-space: nowrap;
`

const Graph = styled.div`
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  min-height: 0;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
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

const WordmarkRow = styled(Grid)`
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  padding-bottom: clamp(2rem, 5vh, 4rem);
`

const WordmarkImg = styled.img`
  display: block;
  width: 100%;
  height: auto;
  filter: brightness(0) invert(1);
`

function Footer() {
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
    <Section id="site-footer">
      <Backdrop>
        <DotField
          ref={fieldRef}
          layout="rings"
          layoutOptions={RING_OPTIONS}
          count={RING_COUNT}
          dotColor={colors.teal}
          dotDiameter={10}
          background={null}
          wander
          cursor
        />
      </Backdrop>

      <Overlay>
        <Mark ref={markRef}>
          FUTURE
          <br />
          BUILT.
        </Mark>
      </Overlay>

      <TopBar>
        <Contact $start={1} $span={6} $spanTablet={4}>
          <Line>info@heartwood.com</Line>
          <Line>
            25 King St W, Toronto,
            <br />
            Ontario M5L 2A1
          </Line>
        </Contact>
        <LinksCell $start={7} $span={6} $startTablet={5} $spanTablet={4}>
          {FOOTER_LINKS.map((label) => (
            <FooterLink key={label} href="#">
              {label}
            </FooterLink>
          ))}
        </LinksCell>
      </TopBar>

      <Graph />

      <WordmarkRow>
        <GridCell $span={12}>
          <WordmarkImg src={Wordmark} alt="Heartwood" />
        </GridCell>
      </WordmarkRow>
    </Section>
  )
}

export default Footer
