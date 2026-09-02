import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, colors } from '../../../themes.js'
import landingImage from '../../../assets/images/landing-image.webp'

gsap.registerPlugin(ScrollTrigger)

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 200vh;
`

/* Sticks for the first viewport of the 200vh Section while the field animates.
   Sticky (compositor-driven) instead of a GSAP pin — see the note in
   Resilience.jsx. */
const Frame = styled.div`
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: clip;
  background-image: url(${landingImage});
  background-size: cover;
  background-position: center;
`

const Hero = styled.div`
  position: absolute;
  top: var(--nav-height, 0px);
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

const Field = styled.div`
  position: absolute;
  inset: 0;

  /* On narrow screens keep the graph from collapsing: pin a min width and let
     it overflow past the viewport (clipped by Hero) so the ring's min(w,h)
     axis never shrinks below this. */
  @media ${GRID.MEDIA_MOBILE} {
    left: 50%;
    right: auto;
    width: 100%;
    min-width: 640px;
    transform: translateX(-50%);
  }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const Tagline = styled.p`
  ${monoCallout}
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: clamp(16rem, 30vw, 26rem);
  color: ${colors.white};
  text-align: center;
  text-wrap: pretty;
  line-height: 1.5;
`

const Corner = styled.p`
  ${monoCallout}
  position: absolute;
  bottom: clamp(1.5rem, 4vh, 3rem);
  left: ${GRID.PADDING}px;
  line-height: 1.15;
  color: ${colors.white};

  @media ${GRID.MEDIA_TABLET} {
    left: ${GRID.PADDING_TABLET}px;
  }

  @media ${GRID.MEDIA_MOBILE} {
    left: ${GRID.PADDING_MOBILE}px;
  }
`

const RING_OPTS = {
  ringDotCounts: [90, 110, 130, 150],
  minRadius: 0.28,
  maxRadius: 0.48,
  radiusScale: 0.92,
  clump: 0.2,
  stray: 0,
  jitter: 12,
}

const STATES = [
  { layout: 'scatter', opts: { margin: 0.06, count: 28 } },
  { layout: 'rings', opts: RING_OPTS },
]

function Landing() {
  const sectionRef = useRef(null)
  const fieldRef = useRef(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self) => {
        if (self.progress > 0) fieldRef.current?.seek(self.progress)
      },
    })

    return () => st.kill()
  }, [])

  return (
    <Section ref={sectionRef}>
      <Frame>
        <Hero>
          <Field>
            <DotField
              ref={fieldRef}
              states={STATES}
              count={28}
              dotColor={colors.lightBlue}
              dotDiameter={10}
            />
          </Field>
          <Overlay>
            <Tagline>
              HEARTWOOD IS A NEXT-GENERATION REAL ESTATE PLATFORM FOCUSED ON
              ENDURING BUILDINGS, HEALTHIER HOMES, STRONGER COMMUNITIES, AND
              DURABLE INVESTMENT RETURNS.
            </Tagline>
            <Corner>
              FUTURE
              <br />
              BUILT.
            </Corner>
          </Overlay>
        </Hero>
      </Frame>
    </Section>
  )
}

export default Landing
