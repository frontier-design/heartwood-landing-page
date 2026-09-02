import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, colors } from '../../../themes.js'
import Wordmark from '../../../assets/images/Heartwood-Wordmark.svg'

// The FUTURE BUILT mark rides this anchor dot, now placed on the lower-right of
// the field (was top-left in the archived footer).
const MARK_ANCHOR = { x: 0.78, y: 0.6, color: colors.teal }

const RING_OPTIONS = {
  ringDotCounts: [90, 150, 210, 300],
  stray: 0.4,
  minRadius: 0.09,
  maxRadius: 0.5,
  anchors: [MARK_ANCHOR],
}
const RING_COUNT = RING_OPTIONS.ringDotCounts.reduce((a, b) => a + b, 0) + RING_OPTIONS.anchors.length

const FOOTER_LINKS = [
  { label: 'Terms', href: '#' },
  { label: 'LinkedIn', href: '#' },
]

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
  align-items: baseline;
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

// Email capture: a dark, thin-bordered input butted against a solid white
// "LEARN MORE" button. Presentational only (no backend) — matches the form on
// the Invest section.
const SignupCell = styled(GridCell)`
  @media ${GRID.MEDIA_MOBILE} {
    margin-top: clamp(1.25rem, 3vh, 2rem);
  }
`

const Signup = styled.form`
  display: flex;
  align-items: stretch;
  width: 100%;
`

// Same inner padding as the Invest form's `control`, but sized for the dark
// footer: black field with a faint light border and a teal CTA.
const EmailInput = styled.input`
  ${monoCallout}
  flex: 1 1 auto;
  min-width: 0;
  color: ${colors.white};
  background: ${colors.black};
  border: 1px solid rgba(237, 237, 237, 0.25);
  border-right: none;
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.7rem, 1.1vw, 0.95rem);
  font-size: clamp(0.8rem, 0.9vw, 1rem);
  outline: none;

  &::placeholder {
    color: rgba(237, 237, 237, 0.5);
  }

  &:focus {
    border-color: ${colors.white};
  }
`

const SubmitButton = styled.button`
  ${monoCallout}
  flex: 0 0 auto;
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1.5rem, 2.5vw, 2.25rem);
  font-size: clamp(0.8rem, 0.9vw, 1rem);
  color: ${colors.black};
  background: ${colors.teal};
  border: none;
  cursor: pointer;
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

  // Park the FUTURE BUILT mark onto its live anchor dot every frame so it drifts
  // and repels with the field.
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
        <Contact $start={1} $span={3} $spanTablet={4} $spanMobile={4}>
          <Line>info@heartwood.com</Line>
          <Line>
            25 King St W, Toronto,
            <br />
            Ontario M5L 2A1
          </Line>
        </Contact>
        <LinksCell $start={4} $span={3} $startTablet={5} $spanTablet={4} $spanMobile={4}>
          {FOOTER_LINKS.map((link) => (
            <FooterLink key={link.label} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </LinksCell>
        <SignupCell $start={9} $span={4} $startTablet={5} $spanTablet={4} $spanMobile={4}>
          <Signup onSubmit={(e) => e.preventDefault()}>
            <EmailInput type="email" placeholder="Enter your email" aria-label="Email address" />
            <SubmitButton type="submit">Learn More</SubmitButton>
          </Signup>
        </SignupCell>
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
