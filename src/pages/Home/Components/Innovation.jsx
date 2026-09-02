import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import innovationImage from '../../../assets/images/full-screen-1.webp'
import innoGreenRoofs from '../../../assets/images/innovation/fr-1.webp'
import innoSolar from '../../../assets/images/innovation/fr-2.webp'
import innoGeothermal from '../../../assets/images/innovation/fr-3.webp'
import innoMassTimber from '../../../assets/images/innovation/fr-4.webp'
import innoPrefab from '../../../assets/images/innovation/fr-5.webp'

const Section = styled.section`
  position: relative;
  width: 100vw;
  background-color: ${colors.gray};
  padding-bottom: clamp(3rem, 8vh, 6rem);

  @media ${GRID.MEDIA_MOBILE} {
    padding-bottom: 0;
  }
`

const Layout = styled(Grid)`
  position: relative;
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

const Body = styled.p`
  ${freightBody}
  margin: clamp(1.5rem, 3vh, 2.25rem) 0 0;
  color: ${colors.black};
`

// The visual: the render sits as a canvas background with labelled marker dots
// on top. Spans the full grid width (col 1 → last), not a viewport full-bleed —
// except on mobile, where it breaks out to the viewport edges (see below).
const Media = styled(GridCell)`
  position: relative;

  /* On mobile the stage becomes a true full-bleed panel: break out of the grid
     padding to the viewport edges. html/body have overflow-x:hidden so the
     100vw overflow can't introduce a horizontal scrollbar. */
  @media ${GRID.MEDIA_MOBILE} {
    width: 100vw;
    margin-left: calc(-50vw + 50%);
  }
`

const Stage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1.9;
  background-image: url(${innovationImage});
  background-size: cover;
  background-position: center;
  overflow: clip;

  /* Mobile: drop the letterboxed ratio and fill the visible viewport height. */
  @media ${GRID.MEDIA_MOBILE} {
    aspect-ratio: auto;
    height: 100svh;
  }
`

// The dots live in a DotField canvas (like the other sections) so they gently
// drift and repel away from the cursor. The five feature dots are `anchors`
// (fixed accent points that still ride the field physics); each label + card is
// positioned onto its live dot every frame.
const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

// Balanced, scattered innovation features. x/y position the dot as a % of the
// stage. `card` = which side the hover card opens (below for top rows, above for
// bottom rows). `flip` opens the card leftward for right-side markers so it never
// clips off the right edge.
const FIELDS = [
  {
    title: 'ROOFTOP SOLAR PV',
    lines: 'ROOFTOP\nSOLAR PV',
    x: 37,
    y: 20,
    card: 'below',
    image: innoSolar,
    desc: 'Panels are installed on roofs, contributing to on-site renewable energy, building resiliency, and a reduced burden on the electrical grid.',
  },
  {
    title: 'GREEN ROOFS',
    lines: 'GREEN\nROOFS',
    x: 77,
    y: 14,
    card: 'below',
    flip: true,
    image: innoGreenRoofs,
    desc: 'Green roofs used where solar is not installed, contributing to biodiversity, cooler cities, and stormwater management.',
  },
  {
    title: 'PREFABRICATED BUILDING ENVELOPES',
    lines: 'PREFABRICATED\nBUILDING ENVELOPES',
    x: 15,
    y: 55,
    card: 'above',
    image: innoPrefab,
    desc: 'Through continuous insulation, proper air-tightness, and triple-glazed windows, energy requirements drop and thermal comfort and resiliency increase, improving resilience to cold weather and power interruptions.',
  },
  {
    title: 'MASS TIMBER AND LOW-CARBON BUILDING MATERIALS',
    lines: 'MASS TIMBER AND\nLOW-CARBON MATERIALS',
    x: 66,
    y: 50,
    card: 'above',
    flip: true,
    image: innoMassTimber,
    desc: 'Natural, low-carbon building materials, such as mass timber structures and low-embodied carbon concrete, reduce the embodied carbon of the construction process compared to typical methods while also adding speed of construction and beauty to projects.',
  },
  {
    title: 'GEOTHERMAL HEATING AND COOLING',
    lines: 'GEOTHERMAL HEATING\nAND COOLING',
    x: 44,
    y: 82,
    card: 'above',
    image: innoGeothermal,
    desc: 'These lower-maintenance systems can be 3 to 4× more energy efficient than traditional gas boilers. They eliminate on-site carbon, improve air quality, and free roof area for solar panels and green roofs.',
  },
]

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`

const MarkerLabel = styled.span`
  ${monoCallout}
  display: block;
  margin-top: 18px;
  white-space: pre-line;
  line-height: 1.35;
  color: ${colors.white};
  font-size: clamp(0.7rem, 0.9vw, 1.05rem);
`

// The card is placed relative to the dot (top-left). It opens downward for top
// markers ($card 'below') and upward for bottom markers ($card 'above'); `$flip`
// anchors it to the right so right-side markers open leftward and don't clip.
// pointer-events stay off so ONLY the label/dot triggers the reveal — hovering
// the card's own (invisible) region never keeps it open.
const Card = styled.div`
  position: absolute;
  ${(p) => (p.$flip ? 'right: 0;' : 'left: 0;')}
  ${(p) => (p.$card === 'below' ? 'top: calc(100% + 14px);' : 'bottom: calc(100% + 14px);')}
  width: clamp(220px, 20vw, 300px);
  background-color: ${colors.gray};
  box-shadow: 0 18px 40px rgba(33, 33, 33, 0.22);
  opacity: 0;
  transform: translateY(${(p) => (p.$card === 'below' ? '-8px' : '8px')});
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 5;
`

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;
`

const CardTitle = styled.p`
  ${monoCallout}
  color: ${colors.teal};
  margin: clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 1.5vw, 1.25rem) clamp(0.4rem, 1vh, 0.6rem);
  font-size: clamp(0.95rem, 1.15vw, 1.25rem);
`

const CardDesc = styled.p`
  ${freightBody}
  color: ${colors.black};
  margin: 0 clamp(1rem, 1.5vw, 1.25rem) clamp(1rem, 1.5vh, 1.25rem);
  font-size: clamp(0.9rem, 0.85vw, 1.05rem);
`

// Only the label box is a hit target (the dot rides at its top-left corner), so
// the card reveal fires on the label/dot alone. Left/top are set per-frame onto
// the live dot position; the % here is just the pre-hydration placement.
const Marker = styled.div`
  position: absolute;
  left: ${(p) => p.$x}%;
  top: ${(p) => p.$y}%;
  pointer-events: auto;
  cursor: pointer;

  &:hover ${Card} {
    opacity: 1;
    transform: translateY(0);
  }
`

function Innovation() {
  const fieldRef = useRef(null)
  const markerRefs = useRef([])
  const anchors = FIELDS.map((f) => ({ x: f.x / 100, y: f.y / 100, color: colors.lightBlue }))

  // Track each anchor dot's live position (drift + cursor repel) and park its
  // label/card onto it every frame, so the labels ride the animated dots.
  useEffect(() => {
    let indices = null
    let raf
    const tick = () => {
      const engine = fieldRef.current?.getEngine()
      if (engine?.dots.length) {
        if (!indices) {
          const found = []
          engine.dots.forEach((d, i) => d.color && found.push(i))
          if (found.length) indices = found
        }
        if (indices) {
          indices.forEach((di, i) => {
            const d = engine.dots[di]
            const el = markerRefs.current[i]
            if (!d || !el) return
            el.style.left = `${d.x + d.nudgeX + d.driftX}px`
            el.style.top = `${d.y + d.nudgeY + d.driftY}px`
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
      <Layout>
        <Left $start={1} $span={5} $spanTablet={5} $spanMobile={4}>
          <Eyebrow>INNOVATION</Eyebrow>
          <Heading>
            Innovation, to us, means building and operating with the future in
            mind.
          </Heading>
          <Body>
            Our intelligence helps us identify innovation opportunities that
            deliver more resilient assets.
          </Body>
        </Left>
        <Media $start={1} $span={12} $rowStart={2} $spanTablet={8} $spanMobile={4}>
          <Stage>
            <Field>
              <DotField
                ref={fieldRef}
                layout="scatter"
                layoutOptions={{ count: 0, anchors }}
                count={FIELDS.length}
                dotColor={colors.lightBlue}
                dotDiameter={9}
                wander={false}
                cursor
              />
            </Field>
            <Overlay>
              {FIELDS.map((f, i) => (
                <Marker
                  key={f.title}
                  ref={(el) => (markerRefs.current[i] = el)}
                  $x={f.x}
                  $y={f.y}
                >
                  <MarkerLabel>{f.lines}</MarkerLabel>
                  <Card $card={f.card} $flip={f.flip}>
                    <CardImage $image={f.image} />
                    <CardTitle>{f.title}</CardTitle>
                    <CardDesc>{f.desc}</CardDesc>
                  </Card>
                </Marker>
              ))}
            </Overlay>
          </Stage>
        </Media>
      </Layout>
    </Section>
  )
}

export default Innovation
