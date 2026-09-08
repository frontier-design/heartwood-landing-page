import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField } from '../../../components/dotfield'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import innovationImage from '../../../assets/images/hover-dots/innovation_background.webp'
import innoSolar from '../../../assets/images/hover-dots/rooftop-solar.jpeg'
import innoGreenRoofs from '../../../assets/images/hover-dots/green-roof.jpeg'
import innoSmartControl from '../../../assets/images/hover-dots/smart_connect.jpeg'
import innoPrefab from '../../../assets/images/hover-dots/prefebraction-ready-envelope.jpeg'
import innoMassTimber from '../../../assets/images/hover-dots/mass-timber.jpeg'
import innoGeothermal from '../../../assets/images/hover-dots/low-energy.jpeg'
import innoCommunity from '../../../assets/images/hover-dots/community-space.jpeg'
import innoPlaygrounds from '../../../assets/images/hover-dots/playground.jpeg'

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
  text-wrap: pretty;
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

  /* Brand-brown wash over the render (the tint used to be baked into the old
     image). Sits above the image but below the dot field + labels. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #3a2316;
    opacity: 0.6;
    pointer-events: none;
  }

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
    x: 18,
    y: 16,
    card: 'below',
    image: innoSolar,
    desc: 'Reduces energy costs for building operations and improves resilience to changes in the electrical grid.',
  },
  {
    title: 'GREEN ROOFS',
    lines: 'GREEN\nROOFS',
    x: 48,
    y: 14,
    card: 'below',
    image: innoGreenRoofs,
    desc: 'Improving insulation, passively managing stormwater, and reducing urban heat island effects.',
  },
  {
    title: 'SMART AND CONNECTED BUILDING CONTROL',
    lines: 'SMART & CONNECTED\nBUILDING CONTROL',
    x: 80,
    y: 18,
    card: 'below',
    flip: true,
    image: innoSmartControl,
    desc: 'From energy and security to mechanical systems, Heartwood utilizes cloud-based controls to monitor, operate, and automate our buildings, improving performance and reducing operating costs.',
  },
  {
    title: 'PREFABRICATION-READY BUILDING ENVELOPES',
    lines: 'PREFABRICATION-READY\nBUILDING ENVELOPES',
    x: 14,
    y: 48,
    card: 'side',
    image: innoPrefab,
    desc: 'Shortens construction timeframe and improves performance, saving costs in construction and operations. Decreases energy usage intensity, improves comfort and tenant satisfaction.',
  },
  {
    title: 'PREFABRICATED MASS TIMBER',
    lines: 'PREFABRICATED\nMASS TIMBER',
    x: 46,
    y: 50,
    card: 'side',
    image: innoMassTimber,
    desc: 'Repeatable mass-timber structures improve construction speed and reduce costs. Mass timber is also a natural, biophilic building material that is local, beautiful, long-lasting, and desirable to our residents.',
  },
  {
    title: 'LOW-ENERGY, DURABLE HEATING AND COOLING',
    lines: 'LOW-ENERGY DURABLE\nHEATING & COOLING',
    x: 82,
    y: 46,
    card: 'side',
    flip: true,
    image: innoGeothermal,
    desc: 'Heat pump-based systems deliver 3–4 times greater energy efficiency than traditional gas boiler systems, while also reducing maintenance and operating costs.',
  },
  {
    title: 'COMMUNITY SPACE',
    lines: 'COMMUNITY\nSPACE',
    x: 20,
    y: 80,
    card: 'above',
    image: innoCommunity,
    desc: 'In an age of technology and increasing social isolation, we intentionally design shared space that brings people together and fosters connection.',
  },
  {
    title: 'PLAYGROUNDS & GARDENS',
    lines: 'PLAYGROUNDS\n& GARDENS',
    x: 50,
    y: 82,
    card: 'above',
    image: innoPlaygrounds,
    desc: 'Access to the outdoors and fresh food should be part of every child\u2019s and adult\u2019s life, which is why we are intentional about designing playgrounds using natural materials and gardens that yield fresh food for our residents to enjoy.',
  },
  {
    title: 'WALKABLE ACCESS TO EVERYDAY ESSENTIALS',
    lines: 'WALKABLE ACCESS TO\nEVERYDAY ESSENTIALS',
    x: 78,
    y: 80,
    card: 'above',
    flip: true,
    desc: 'Walkable neighborhoods promote physical and mental well-being while creating more desirable places to live and supporting long-term resident retention.',
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
  width: clamp(220px, 20vw, 300px);
  background-color: ${colors.gray};
  box-shadow: 0 18px 40px rgba(33, 33, 33, 0.22);
  opacity: 0;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 5;

  /* 'side' opens the card horizontally beside the dot and vertically centred on
     it, so a tall middle-row card can't run past the top/bottom of the stage.
     'below'/'above' open down/up as before for the top and bottom rows. */
  ${(p) =>
    p.$card === 'side'
      ? `
        ${p.$flip ? 'right: calc(100% + 14px);' : 'left: calc(100% + 14px);'}
        top: 50%;
        transform: translate(${p.$flip ? '8px' : '-8px'}, -50%);
      `
      : `
        ${p.$flip ? 'right: 0;' : 'left: 0;'}
        ${p.$card === 'below' ? 'top: calc(100% + 14px);' : 'bottom: calc(100% + 14px);'}
        transform: translateY(${p.$card === 'below' ? '-8px' : '8px'});
      `}
`

const CardImage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(${(p) => p.$image});
    background-size: cover;
    background-position: center;
    filter: grayscale(1);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${colors.gold};
    mix-blend-mode: multiply;
    opacity: 0.75;
  }
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
    transform: ${(p) => (p.$card === 'side' ? 'translate(0, -50%)' : 'translateY(0)')};
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
            Innovation, to us, is practical: it&rsquo;s building and operating
            with the future in mind.
          </Heading>
          <Body>
            Our intelligence platform helps us identify opportunities worth
            acting on.
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
                  $card={f.card}
                >
                  <MarkerLabel>{f.lines}</MarkerLabel>
                  <Card $card={f.card} $flip={f.flip}>
                    {f.image && <CardImage $image={f.image} />}
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
