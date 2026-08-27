import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID } from '../../../grid'
import { DotField, ringGeometry } from '../../../components/dotfield'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import timBlairPhoto from '../../../assets/images/people/tim-blair.webp'
import davidConstablePhoto from '../../../assets/images/people/david-constable.webp'
import georgeTheuvenetPhoto from '../../../assets/images/people/George Theneuvenet.webp'
import rebekahTobiasPhoto from '../../../assets/images/people/Rebekah Tobias.webp'
import janeChanPhoto from '../../../assets/images/people/Jane Chan.webp'
import dylanKentPhoto from '../../../assets/images/people/Dylan Kent.webp'
import carlyForresterPhoto from '../../../assets/images/people/Carly Forrester.webp'
import nicolasGreenPhoto from '../../../assets/images/people/Nicolas Green.webp'
import geoffreyTurnbullPhoto from '../../../assets/images/people/Geoffrey Turnbull.webp'
import jonathanGrahamPhoto from '../../../assets/images/people/Jonathan Graham.webp'
import intelligenceImage from '../../../assets/images/other-web/intelligence.webp'
import innovationImage from '../../../assets/images/other-web/innovation.webp'
import innoGreenRoofs from '../../../assets/images/innovation/fr-1.webp'
import innoSolar from '../../../assets/images/innovation/fr-2.webp'
import innoGeothermal from '../../../assets/images/innovation/fr-3.webp'
import innoMassTimber from '../../../assets/images/innovation/fr-4.webp'
import innoPrefab from '../../../assets/images/innovation/fr-5.webp'

gsap.registerPlugin(ScrollTrigger)

const TABS = [
  {
    key: 'EXPERTISE',
    heading:
      'Heartwood was founded by two industry leaders with a proven track record, having overseen billions of dollars in real estate transactions.',
    body: 'They\u2019ve built a diverse team of interdisciplinary experts united by one goal: maximizing wealth creation for our investors.',
  },
  {
    key: 'INTELLIGENCE',
    heading:
      'Real-time advanced analytics capabilities give our team the clarity and conviction to make smarter decisions and drive returns.',
  },
  {
    key: 'INNOVATION',
    heading:
      'Innovation, to us, means building and operating with the future in mind. Our intelligence helps us identify innovation opportunities that deliver more resilient assets.',
  },
]

const PARTNERS = [
  {
    name: 'Tim Blair',
    role: 'Founding Partner',
    bio: 'Tim brings 20 years of real estate investment banking and private equity experience, having completed over $8B in transactions for complex commercial and mixed-use residential developments within the Americas and Europe.',
    image: timBlairPhoto,
  },
  {
    name: 'David Constable',
    role: 'Founding Partner',
    bio: 'David has over 20 years of experience in international architecture and real estate development, having completed $5B in project design and management, with a priority on low carbon, design excellence.',
    image: davidConstablePhoto,
  },
]

const TEAM = [
  { name: 'George Theuvenet', role: 'Senior Advisor', image: georgeTheuvenetPhoto },
  { name: 'Rebekah Tobias', role: 'Senior Advisor', image: rebekahTobiasPhoto },
  { name: 'Jane Chan', role: 'Vice President, Capital and Corporate Development', image: janeChanPhoto },
  { name: 'Dylan Kent', role: 'Director, Capital Markets', image: dylanKentPhoto },
  { name: 'Carly Forrester', role: 'Director, Development and Planning', image: carlyForresterPhoto },
  { name: 'Nicolas Green', role: 'Director, Construction', image: nicolasGreenPhoto },
  { name: 'Geoffrey Turnbull', role: 'Director, Innovation and Sustainability', image: geoffreyTurnbullPhoto },
  { name: 'Jonathan Graham', role: 'Manager, Building Performance', image: jonathanGrahamPhoto },
]

const FOUR_COLS = `calc((min(${GRID.MAX_WIDTH}px, 100vw) - ${GRID.PADDING * 2 + GRID.GAP * (GRID.COLUMNS - 1)}px) / ${GRID.COLUMNS} * 4 + ${GRID.GAP * 3}px)`

const HAIRLINE = 'rgba(237, 237, 237, 0.12)'

const INTEL_RING_OPTIONS = {
  ringDotCounts: [700, 140, 140, 140],
  stray: [1, 0.06, 0.06, 0.06],
  minRadius: 0.06,
  maxRadius: 0.58,
}

const INTEL_COUNT = INTEL_RING_OPTIONS.ringDotCounts.reduce((a, b) => a + b, 0)

const INTEL_LABELS = ['ADVANCED\nANALYTICS', 'STRUCTURED DATA', 'UNSTRUCTURED DATA']

const INNOVATION = [
  {
    key: 'GREEN ROOFS',
    lines: ['GREEN', 'ROOFS'],
    x: 0.77,
    y: 0.08,
    card: 'below',
    image: innoGreenRoofs,
    desc: 'Green roofs used where solar is not installed, contributing to biodiversity, cooler cities, and stormwater management.',
  },
  {
    key: 'ROOFTOP SOLAR PV',
    lines: ['ROOFTOP', 'SOLAR PV'],
    x: 0.37,
    y: 0.28,
    card: 'below',
    image: innoSolar,
    desc: 'Panels are installed on roofs, contributing to on-site renewable energy, building resiliency, and a reduced burden on the electrical grid.',
  },
  {
    key: 'MASS TIMBER AND LOW-CARBON BUILDING MATERIALS',
    lines: ['MASS TIMBER AND', 'LOW-CARBON', 'BUILDING MATERIALS'],
    x: 0.69,
    y: 0.52,
    card: 'above',
    image: innoMassTimber,
    desc: 'Natural, low-carbon building materials, such as mass timber structures and low-embodied carbon concrete, reduce the embodied carbon of the construction process compared to typical methods while also adding speed of construction and beauty to projects.',
  },
  {
    key: 'PREFABRICATED BUILDING ENVELOPES',
    lines: ['PREFABRICATION', 'BUILDING ENVELOPES'],
    x: 0.17,
    y: 0.59,
    card: 'above',
    image: innoPrefab,
    desc: 'Through continuous insulation, proper air-tightness, and triple-glazed windows, energy requirements drop and thermal comfort and resiliency increase, improving resilience to cold weather and power interruptions.',
  },
  {
    key: 'GEOTHERMAL HEATING AND COOLING',
    lines: ['GEOTHERMAL HEATING', 'AND COOLING'],
    x: 0.65,
    y: 0.86,
    card: 'above',
    image: innoGeothermal,
    desc: 'These lower-maintenance systems can be 3 to 4× more energy efficient than traditional gas boilers. They eliminate on-site carbon, improve air quality, and free roof area for solar panels and green roofs.',
  },
]

const CARD_TRANSFORMS = {
  above: {
    show: 'translate(-50%, calc(-100% - 28px))',
    hide: 'translate(-50%, calc(-100% - 12px))',
  },
  below: {
    show: 'translate(-50%, 28px)',
    hide: 'translate(-50%, 12px)',
  },
}

const tabFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const tabFadeStill = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

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
  padding-block: clamp(2rem, 6vh, 4rem);
`

const Right = styled(GridCell)`
  position: relative;
  height: 100%;
  background-color: ${colors.white};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    right: -50vw;
    background-color: ${(p) => (p.$dark ? colors.black : 'transparent')};
    z-index: 0;
  }

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;

    &::before {
      left: -50vw;
      right: -50vw;
    }
  }
`

const TabText = styled.div`
  animation: ${tabFade} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`

const TabPanel = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  animation: ${tabFadeStill} 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
  }
`

const ScrollArea = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    overflow: visible;
  }
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1rem, 2vw, 2rem);
  margin-bottom: clamp(2rem, 5vh, 3.5rem);
`

const NavLink = styled.button`
  ${monoCallout}
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${(p) => (p.$active ? colors.teal : colors.lightBlue)};
  transition: color 0.2s ease;
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const Body = styled.p`
  ${freightBody}
  margin: clamp(1.5rem, 4vh, 2.5rem) 0 0;
  color: ${colors.black};
  max-width: ${FOUR_COLS};

  @media ${GRID.MEDIA_MOBILE} {
    max-width: none;
  }
`

const BleedLine = `
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: -50vw;
    bottom: 0;
    height: 1px;
    background-color: ${HAIRLINE};
  }

  @media ${GRID.MEDIA_MOBILE} {
    &::after {
      left: -50vw;
    }
  }
`

const Card = styled.article`
  display: grid;
  grid-template-columns: 1fr 1fr;
  ${BleedLine}
`

const Photo = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_MOBILE} {
    margin-left: -50vw;
    width: calc(100% + 50vw);
    aspect-ratio: auto;
    height: clamp(180px, 40vw, 300px);
  }
`

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1rem, 2vw, 2rem);
`

const PartnerName = styled.h3`
  font-family: 'PP Frama', sans-serif;
  font-weight: 500;
  line-height: 1.05;
  font-size: clamp(1.6rem, 2.4vw, 2.6rem);
  margin: 0;
  color: ${colors.white};
`

const Role = styled.p`
  ${monoCallout}
  color: ${colors.teal};
  margin: clamp(0.5rem, 1vh, 0.75rem) 0 clamp(1rem, 2vh, 1.5rem);
  font-size: clamp(0.7rem, 0.85vw, 0.95rem);
`

const Bio = styled.p`
  ${freightBody}
  color: ${colors.white};
  margin: 0;
  font-size: clamp(1rem, 0.95vw, 1.15rem);
`

const TeamList = styled.div``

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(1.1rem, 2.4vh, 1.8rem) 0 clamp(1.1rem, 2.4vh, 1.8rem) clamp(1rem, 2vw, 2rem);
  ${BleedLine}
`

const TeamName = styled.span`
  font-family: 'PP Frama', sans-serif;
  font-weight: 500;
  font-size: clamp(1.25rem, 1.9vw, 2rem);
  color: ${colors.white};
`

const TeamRole = styled.span`
  ${monoCallout}
  color: ${colors.teal};
  font-size: clamp(0.65rem, 0.8vw, 0.9rem);
  line-height: 1.35;
  text-align: right;
  max-width: 45%;
`

const HoverPhoto = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: clamp(120px, 11vw, 175px);
  aspect-ratio: 1;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 20;

  @media ${GRID.MEDIA_MOBILE} {
    display: none;
  }
`

const IntelStage = styled.div`
  position: relative;
  height: 100vh;
  width: calc(100% + ${GRID.PADDING}px);
  background-image: url(${intelligenceImage});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_TABLET} {
    width: calc(100% + ${GRID.PADDING_TABLET}px);
  }

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    aspect-ratio: 3 / 4;
    margin-left: -${GRID.PADDING_MOBILE}px;
    width: calc(100% + ${GRID.PADDING_MOBILE * 2}px);
  }
`

const IntelField = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const IntelOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
`

const IntelLabel = styled.span`
  ${monoCallout}
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.35;
  white-space: pre-line;
  color: ${colors.black};
  font-size: clamp(0.7rem, 0.85vw, 1rem);
`

const InnoStage = styled.div`
  position: relative;
  height: 100vh;
  width: calc(100% + ${GRID.PADDING}px);
  background-image: url(${innovationImage});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_TABLET} {
    width: calc(100% + ${GRID.PADDING_TABLET}px);
  }

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    aspect-ratio: 3 / 4;
    margin-left: -${GRID.PADDING_MOBILE}px;
    width: calc(100% + ${GRID.PADDING_MOBILE * 2}px);
  }
`

const InnoField = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
`

const InnoOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`

const Marker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
`

const MarkerHit = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  cursor: pointer;
`

const MarkerLabel = styled.span`
  ${monoCallout}
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  line-height: 1.35;
  color: ${colors.black};
  font-size: clamp(0.7rem, 0.85vw, 1rem);
  cursor: pointer;
`

const InfoCard = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transform: ${(p) => CARD_TRANSFORMS[p.$card][p.$show ? 'show' : 'hide']};
  opacity: ${(p) => (p.$show ? 1 : 0)};
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  width: clamp(220px, 20vw, 300px);
  background-color: ${colors.black};
  z-index: 5;
  pointer-events: none;
`

const CardImage = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;
`

const CardTitle = styled.p`
  ${monoCallout}
  color: ${colors.teal};
  margin: clamp(0.75rem, 1.5vh, 1rem) clamp(1rem, 1.5vw, 1.25rem) clamp(0.4rem, 1vh, 0.6rem);
  font-size: clamp(0.7rem, 0.85vw, 0.95rem);
`

const CardDesc = styled.p`
  ${freightBody}
  color: ${colors.white};
  margin: 0 clamp(1rem, 1.5vw, 1.25rem) clamp(1rem, 1.5vh, 1.25rem);
  font-size: clamp(0.9rem, 0.85vw, 1.05rem);
`

function Pillars() {
  const [active, setActive] = useState(0)
  const [hoveredInno, setHoveredInno] = useState(null)
  const tab = TABS[active]

  const sectionRef = useRef(null)
  const scrollRef = useRef(null)
  const photoRef = useRef(null)
  const intelFieldRef = useRef(null)
  const intelLabelRefs = useRef([])
  const intelCenterRef = useRef(null)
  const innoFieldRef = useRef(null)
  const markerRefs = useRef([])
  const innoLabelRefs = useRef([])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [active])

  useEffect(() => {
    if (active !== 0) return
    const mm = gsap.matchMedia()
    mm.add(`(min-width: ${parseInt(GRID.BREAKPOINT, 10) + 1}px)`, () => {
      const distance = () => {
        const el = scrollRef.current
        return el ? el.scrollHeight - el.clientHeight : 0
      }
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        refreshPriority: 2,
        onUpdate: (self) => {
          const el = scrollRef.current
          if (el) el.scrollTop = self.progress * distance()
        },
      })
      return () => st.kill()
    })
    return () => mm.revert()
  }, [active])

  useEffect(() => {
    if (active !== 1) return
    let raf
    const tick = () => {
      const engine = intelFieldRef.current?.getEngine()
      if (engine?.dots.length) {
        const { cx, cy, radii } = ringGeometry(engine.w, engine.h, INTEL_RING_OPTIONS)
        intelLabelRefs.current.forEach((el, i) => {
          if (!el) return
          el.style.left = `${cx}px`
          el.style.top = `${cy - (radii[i] + radii[i + 1]) / 2}px`
        })
        if (intelCenterRef.current) {
          intelCenterRef.current.style.left = `${cx}px`
          intelCenterRef.current.style.top = `${cy}px`
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  useEffect(() => {
    if (active !== 2) return
    const indices = { current: null }
    let raf
    const tick = () => {
      const engine = innoFieldRef.current?.getEngine()
      if (engine?.dots.length) {
        if (!indices.current) {
          const found = []
          engine.dots.forEach((d, i) => d.color && found.push(i))
          if (found.length) indices.current = found
        }
        if (indices.current) {
          const off = Math.min(engine.w, engine.h) * 0.012
          const padX = Math.min(engine.w, engine.h) * 0.008
          indices.current.forEach((di, i) => {
            const d = engine.dots[di]
            const marker = markerRefs.current[i]
            const label = innoLabelRefs.current[i]
            if (!d) return
            if (marker) {
              marker.style.left = `${d.x + d.nudgeX + d.driftX}px`
              marker.style.top = `${d.y + d.nudgeY + d.driftY}px`
            }
            if (label) {
              label.style.left = `${padX}px`
              label.style.top = `${off}px`
            }
          })
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const movePhoto = (e) => {
    const el = photoRef.current
    if (!el) return
    el.style.left = `${e.clientX}px`
    el.style.top = `${e.clientY}px`
  }

  const showPhoto = (image) => {
    const el = photoRef.current
    if (!el) return
    el.style.backgroundImage = `url(${image})`
    el.style.opacity = '1'
  }

  const hidePhoto = () => {
    const el = photoRef.current
    if (el) el.style.opacity = '0'
  }

  return (
    <Section ref={sectionRef}>
      <Layout>
        <Left $start={1} $span={6} $spanTablet={4}>
          <Nav>
              {TABS.map((t, i) => (
                <NavLink key={t.key} $active={i === active} onClick={() => setActive(i)}>
                  {t.key}
                </NavLink>
              ))}
            </Nav>
          <TabText key={active}>
            <Heading>{tab.heading}</Heading>
            {tab.body && <Body>{tab.body}</Body>}
          </TabText>
        </Left>
        <Right $start={7} $span={6} $startTablet={5} $spanTablet={4} $dark={active === 0}>
          <TabPanel key={active}>
          {active === 0 && (
            <ScrollArea ref={scrollRef}>
              {PARTNERS.map((p) => (
                <Card key={p.name}>
                  <Photo $image={p.image} />
                  <CardText>
                    <PartnerName>{p.name}</PartnerName>
                    <Role>{p.role}</Role>
                    <Bio>{p.bio}</Bio>
                  </CardText>
                </Card>
              ))}
              <TeamList>
                {TEAM.map((m) => (
                  <Row
                    key={m.name}
                    onMouseEnter={() => showPhoto(m.image)}
                    onMouseLeave={hidePhoto}
                    onMouseMove={movePhoto}
                  >
                    <TeamName>{m.name}</TeamName>
                    <TeamRole>{m.role}</TeamRole>
                  </Row>
                ))}
              </TeamList>
            </ScrollArea>
          )}
          {active === 1 && (
                  <IntelStage>
                    <IntelField>
                      <DotField
                        ref={intelFieldRef}
                        layout="rings"
                        layoutOptions={INTEL_RING_OPTIONS}
                        count={INTEL_COUNT}
                        dotColor={colors.lightBlue}
                        dotDiameter={7}
                        wander={false}
                        background={null}
                      />
                    </IntelField>
                    <IntelOverlay>
                      {INTEL_LABELS.map((label, i) => (
                        <IntelLabel key={label} ref={(el) => (intelLabelRefs.current[i] = el)}>
                          {label}
                        </IntelLabel>
                      ))}
                      <IntelLabel ref={intelCenterRef}>{'BETTER\nDECISIONS'}</IntelLabel>
                    </IntelOverlay>
                  </IntelStage>
                )}
                {active === 2 && (
                  <InnoStage>
                    <InnoField>
                      <DotField
                        ref={innoFieldRef}
                        layout="scatter"
                        layoutOptions={{
                          count: 0,
                          anchors: INNOVATION.map((m) => ({ x: m.x, y: m.y, color: colors.black })),
                        }}
                        count={INNOVATION.length}
                        dotColor={colors.black}
                        dotDiameter={12}
                        wander={false}
                        background={null}
                      />
                    </InnoField>
                    <InnoOverlay>
                      {INNOVATION.map((m, i) => (
                        <Marker
                          key={m.key}
                          ref={(el) => (markerRefs.current[i] = el)}
                          onMouseEnter={() => setHoveredInno(i)}
                          onMouseLeave={() => setHoveredInno(null)}
                        >
                          <MarkerLabel ref={(el) => (innoLabelRefs.current[i] = el)}>
                            {m.lines.map((line, j) => (
                              <span key={line}>
                                {j > 0 && <br />}
                                {line}
                              </span>
                            ))}
                          </MarkerLabel>
                          <MarkerHit />
                          <InfoCard $card={m.card} $show={hoveredInno === i}>
                            <CardImage $image={m.image} />
                            <CardTitle>{m.key}</CardTitle>
                            <CardDesc>{m.desc}</CardDesc>
                          </InfoCard>
                        </Marker>
                      ))}
                    </InnoOverlay>
                  </InnoStage>
                )}
          </TabPanel>
        </Right>
      </Layout>
      <HoverPhoto ref={photoRef} />
    </Section>
  )
}

export default Pillars
