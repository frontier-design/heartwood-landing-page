import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, colors } from '../../../themes.js'
import hamiltonMain from '../../../assets/images/places/Hamilton, ON 1570 Main Street West.webp'
import hamiltonParkside from '../../../assets/images/places/Hamilton, ON 308 Parkside Drive.webp'
import mississaugaTomken from '../../../assets/images/places/Mississauga, ON 4094 Tomken Road.webp'
import orilliaOxford from '../../../assets/images/places/Orillia, ON 175 Oxford Street.webp'
import ottawaKennedy from '../../../assets/images/places/Ottawa, ON 360 Kennedy Lane.webp'
import torontoLawrence2102 from '../../../assets/images/places/Toronto, ON 2102 Lawrence Avenue East.webp'
import torontoLawrence3385 from '../../../assets/images/places/Toronto, ON 3385 Lawrence Avenue East.webp'
import torontoSherbourne from '../../../assets/images/places/Toronto, ON 353 Sherbourne St.webp'

// 2102 Lawrence leads so it is the default-expanded item on the left.
const PROJECTS = [
  { location: 'TORONTO, ONTARIO', name: '2102 Lawrence Avenue East', status: 'PENDING', image: `url(${torontoLawrence2102})` },
  { location: 'ORILLIA, ONTARIO', name: '175 Oxford Street', status: 'PENDING', image: `url(${orilliaOxford})` },
  { location: 'HAMILTON, ONTARIO', name: '1570 Main Street West', status: 'PENDING', image: `url(${hamiltonMain})` },
  { location: 'MISSISSAUGA, ONTARIO', name: '4094 Tomken Road', status: 'PENDING', image: `url(${mississaugaTomken})` },
  { location: 'TORONTO, ONTARIO', name: '353 Sherbourne Street', status: 'PENDING', image: `url(${torontoSherbourne})` },
  { location: 'OTTAWA, ONTARIO', name: '360 Kennedy Lane', status: 'PENDING', image: `url(${ottawaKennedy})` },
  { location: 'HAMILTON, ONTARIO', name: '308 Parkside Drive', status: 'PENDING', image: `url(${hamiltonParkside})` },
  { location: 'TORONTO, ONTARIO', name: '3385 Lawrence Avenue East', status: 'PENDING', image: `url(${torontoLawrence3385})` },
]

const INITIAL = 0

const Section = styled.section`
  position: relative;
  width: 100vw;
  background-color: ${colors.gray};
  padding: clamp(3rem, 8vh, 6rem) 0;

  @media ${GRID.MEDIA_MOBILE} {
    padding-bottom: 0;
  }
`

const Layout = styled(Grid)`
  position: relative;
`

// Contained in the grid (cols 1 → 12), no longer a viewport full-bleed.
const Row = styled(GridCell)`
  display: flex;
  height: clamp(34rem, 88vh, 64rem);
  overflow: hidden;

  @media ${GRID.MEDIA_MOBILE} {
    flex-direction: column;
    height: auto;
  }
`

const Item = styled.div`
  position: relative;
  flex-grow: ${(p) => (p.$active ? 5 : 1)};
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 0;
  overflow: hidden;
  cursor: pointer;
  transition: flex-grow 1s cubic-bezier(0.16, 1, 0.3, 1);

  /* The image lives on a layer inset 5px above the top; the parent's
     overflow:hidden clips that top strip (crop 5px off the top) while
     background:cover keeps the rest filled — no gap at the bottom. */
  &::before {
    content: '';
    position: absolute;
    inset: -5px 0 0 0;
    z-index: 0;
    background: ${(p) => p.$image};
    background-size: cover;
    background-position: center;
  }

  @media ${GRID.MEDIA_MOBILE} {
    flex-basis: auto;
    flex-grow: 0;
    height: 45vh;
    min-height: 0;
    cursor: default;
    transition: none;
  }
`

// Dark card pinned to the top-left of the active item.
const Info = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: clamp(4rem, 12vh, 8rem) clamp(1.5rem, 3vw, 3rem) clamp(1.35rem, 2.7vw, 2.7rem);
  background: linear-gradient(
    to top,
    rgba(33, 33, 33, 0.97) 0%,
    rgba(33, 33, 33, 0.72) 45%,
    rgba(33, 33, 33, 0) 100%
  );
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.3s' : '0s')};
  pointer-events: none;

  @media ${GRID.MEDIA_MOBILE} {
    opacity: 1;
    transition: none;
  }
`

const Location = styled.p`
  ${monoCallout}
  margin: 0;
  color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.45s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.45s' : '0s')};

  @media ${GRID.MEDIA_MOBILE} {
    opacity: 1;
    transform: none;
    transition: none;
  }
`

const Status = styled.p`
  ${monoCallout}
  margin: clamp(0.35rem, 0.8vh, 0.6rem) 0 0;
  color: ${colors.gold};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.55s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.55s' : '0s')};

  @media ${GRID.MEDIA_MOBILE} {
    opacity: 1;
    transform: none;
    transition: none;
  }
`

const Name = styled.h3`
  ${displayHeading}
  margin: clamp(0.5rem, 1.5vh, 1rem) 0 0;
  text-transform: uppercase;
  color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.65s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.65s' : '0s')};

  @media ${GRID.MEDIA_MOBILE} {
    margin-top: clamp(0.4rem, 1.2vh, 0.75rem);
    opacity: 1;
    transform: none;
    transition: none;
  }
`

function Projects() {
  const [active, setActive] = useState(INITIAL)
  const [paused, setPaused] = useState(false)

  // While no one is hovering, sweep the expanded item through the row one at a
  // time so the width extension animates sequentially. Hovering pauses it.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setActive((a) => (a + 1) % PROJECTS.length)
    }, 3600)
    return () => clearInterval(id)
  }, [paused])

  return (
    <Section id="properties">
      <Layout>
        <Row
          $start={1}
          $span={12}
          $spanTablet={8}
          $spanMobile={4}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {PROJECTS.map((p, i) => (
            <Item
              key={p.name}
              $active={i === active}
              $image={p.image}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <Info $active={i === active}>
                <Location $active={i === active}>{p.location}</Location>
                <Status $active={i === active}>{p.status}</Status>
                <Name $active={i === active}>{p.name}</Name>
              </Info>
            </Item>
          ))}
        </Row>
      </Layout>
    </Section>
  )
}

export default Projects
