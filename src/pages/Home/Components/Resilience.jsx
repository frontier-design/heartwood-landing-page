import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import carousel1 from '../../../assets/images/carousel/carousel-1.webp'
import carousel2 from '../../../assets/images/carousel/carousel-2.webp'
import carousel3 from '../../../assets/images/carousel/carousel-3.webp'

gsap.registerPlugin(ScrollTrigger)

const EYEBROW = 'RESILIENCE'

const FOUR_COLS = `calc((min(${GRID.MAX_WIDTH}px, 100vw) - ${GRID.PADDING * 2 + GRID.GAP * (GRID.COLUMNS - 1)}px) / ${GRID.COLUMNS} * 4 + ${GRID.GAP * 3}px)`

const SLIDES = [
  {
    heading: 'Resilient buildings',
    body: 'Building comfortable and durable homes that support well-being for our residents. Resilient homes are also operationally efficient.',
    image: `url(${carousel1})`,
  },
  {
    heading: 'Resilient communities',
    body: 'Our communities are designed with a compounding effect in mind. Clean air, daylight, walkable neighbourhoods, and thoughtful shared spaces lead to homes that support well-being for our residents.',
    image: `url(${carousel2})`,
  },
  {
    heading: 'Resilient investments',
    body: 'The result is places people love to live and portfolios that generate durable value for investors.',
    image: `url(${carousel3})`,
  },
]

/* Scroll track: one viewport per slide. The visible Section sticks inside it, so
   the "pin" is handled by the compositor rather than by GSAP toggling
   position:fixed from JS. A JS pin lags the browser's scroll paint by a frame,
   which showed the white body behind the pin-spacer whenever a snap parked the
   scroll exactly on the pin boundary and the next wheel tick crossed it. The
   track shares the Section's background so any subpixel seam stays dark. */
const Track = styled.div`
  position: relative;
  height: calc(100vh * ${SLIDES.length});
  height: calc(100lvh * ${SLIDES.length});
  background-color: ${colors.black};
`

const Section = styled.section`
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  height: 100lvh;
  background-color: ${colors.black};
  overflow: clip;
`

const Background = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: ${(p) => p.$image};
  background-size: cover;
  background-position: center;
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to top, rgba(33, 33, 33, 0.75) 0%, rgba(33, 33, 33, 0.15) 45%, rgba(33, 33, 33, 0) 70%),
    linear-gradient(to right, rgba(33, 33, 33, 0.4) 0%, rgba(33, 33, 33, 0) 55%);
`

const Content = styled(Grid)`
  position: relative;
  z-index: 2;
  height: 100%;
`

const Column = styled(GridCell)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: clamp(1rem, 3vh, 2rem);
  padding-bottom: clamp(2.5rem, 7vh, 5rem);
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0;
  color: ${colors.white};
`

const TextStack = styled.div`
  display: grid;
  max-width: ${FOUR_COLS};

  @media ${GRID.MEDIA_MOBILE} {
    max-width: none;
  }
`

const TextBlock = styled.div`
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-self: end;
  pointer-events: ${(p) => (p.$active ? 'auto' : 'none')};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0 0 clamp(1rem, 2.5vh, 1.75rem);
  color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1.5rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.15s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.15s' : '0s')};
`

const Body = styled.p`
  ${freightBody}
  margin: 0;
  color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1.5rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.3s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.3s' : '0s')};
`

const Dots = styled.div`
  position: absolute;
  top: 50%;
  right: clamp(1.25rem, 2.5vw, 2.75rem);
  transform: translateY(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vh, 1.25rem);
`

const Dot = styled.button`
  width: 10px;
  height: 10px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0.4)};
  transition: opacity 0.2s ease;
`

function Resilience() {
  const trackRef = useRef(null)
  const stRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const last = SLIDES.length - 1
    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: 'top top',
      // Track bottom meets viewport bottom exactly when the sticky Section stops
      // sticking, so progress 0→1 maps onto the full stuck range.
      end: 'bottom bottom',
      scrub: 0.4,
      // Snap to the nearest slide (not directional) with a single settle duration
      // and no delay, so the snap tween doesn't overlap the scrub easing — that
      // overlap was causing a small overshoot/jump at the moment of snapping.
      snap: {
        snapTo: 1 / last,
        duration: 0.4,
        ease: 'power2.inOut',
        directional: false,
      },
      onUpdate: (self) => {
        const idx = Math.round(self.progress * last)
        setActive((prev) => (prev === idx ? prev : idx))
      },
    })
    stRef.current = st

    return () => st.kill()
  }, [])

  const goTo = (i) => {
    const st = stRef.current
    if (!st) return
    const target = st.start + (i / (SLIDES.length - 1)) * (st.end - st.start)
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <Track ref={trackRef}>
      <Section>
        {SLIDES.map((s, i) => (
          <Background key={s.heading} $image={s.image} $active={i === active} />
        ))}
        <Overlay />
        <Content>
          <Column $start={1} $span={6} $spanTablet={5}>
            <Eyebrow>{EYEBROW}</Eyebrow>
            <TextStack>
              {SLIDES.map((s, i) => (
                <TextBlock key={s.heading} $active={i === active}>
                  <Heading $active={i === active}>{s.heading}</Heading>
                  <Body $active={i === active}>{s.body}</Body>
                </TextBlock>
              ))}
            </TextStack>
          </Column>
        </Content>
        <Dots>
          {SLIDES.map((s, i) => (
            <Dot
              key={s.heading}
              $active={i === active}
              onClick={() => goTo(i)}
              aria-label={s.heading}
            />
          ))}
        </Dots>
      </Section>
    </Track>
  )
}

export default Resilience
