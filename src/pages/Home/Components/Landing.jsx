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

const Frame = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
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
`

const Field = styled.div`
  position: absolute;
  inset: 0;
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
  color: ${colors.white};
  white-space: nowrap;
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

const STATES = [
  { layout: 'scatter', opts: { margin: 0.06, count: 28 } },
  { layout: 'rings', opts: { rings: 1, clump: 0.5, stray: 0.06, count: 140 } },
]

function Landing() {
  const sectionRef = useRef(null)
  const frameRef = useRef(null)
  const fieldRef = useRef(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: frameRef.current,
      pinSpacing: false,
      scrub: 0.3,
      onUpdate: (self) => {
        if (self.progress > 0) fieldRef.current?.seek(self.progress)
      },
    })

    // GSAP freezes the pinned Frame's pixel size and only recalculates it on a
    // debounced refresh, which stalls the DotField's ResizeObserver. The
    // DotField's own ResizeObserver rescales the canvas live during the drag;
    // we only defer the expensive cross-trigger refresh to when resizing stops
    // so a drag isn't a storm of full-layout recalcs.
    let refreshTimer
    const onResize = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
    }
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshTimer)
      window.removeEventListener('resize', onResize)
      st.kill()
    }
  }, [])

  return (
    <Section ref={sectionRef}>
      <Frame ref={frameRef}>
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
            <Tagline>BUILDING THE FUTURE OF REAL ESTATE</Tagline>
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
