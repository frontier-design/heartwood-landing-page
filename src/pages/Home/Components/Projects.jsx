import { useState } from 'react'
import styled from 'styled-components'
import { GRID } from '../../../grid'
import { monoCallout, colors } from '../../../themes.js'
import hamiltonMain from '../../../assets/images/places/Hamilton, ON 1570 Main Street West.webp'
import hamiltonParkside from '../../../assets/images/places/Hamilton, ON 308 Parkside Drive.webp'
import mississaugaTomken from '../../../assets/images/places/Mississauga, ON 4094 Tomken Road.webp'
import orilliaOxford from '../../../assets/images/places/Orillia, ON 175 Oxford Street.webp'
import ottawaKennedy from '../../../assets/images/places/Ottawa, ON 360 Kennedy Lane.webp'
import torontoLawrence2102 from '../../../assets/images/places/Toronto, ON 2102 Lawrence Avenue East.webp'
import torontoLawrence3385 from '../../../assets/images/places/Toronto, ON 3385 Lawrence Avenue East.webp'
import torontoSherbourne from '../../../assets/images/places/Toronto, ON 353 Sherbourne St.webp'

const PROJECTS = [
  { location: 'ORILLIA, ON', name: '175 Oxford Street', image: `url(${orilliaOxford})` },
  { location: 'TORONTO, ON', name: '2102 Lawrence Avenue East', image: `url(${torontoLawrence2102})` },
  { location: 'HAMILTON, ON', name: '1570 Main Street West', image: `url(${hamiltonMain})` },
  { location: 'MISSISSAUGA, ON', name: '4094 Tomken Road', image: `url(${mississaugaTomken})` },
  { location: 'TORONTO, ON', name: '353 Sherbourne Street', image: `url(${torontoSherbourne})` },
  { location: 'OTTAWA, ON', name: '360 Kennedy Lane', image: `url(${ottawaKennedy})` },
  { location: 'HAMILTON, ON', name: '308 Parkside Drive', image: `url(${hamiltonParkside})` },
  { location: 'TORONTO, ON', name: '3385 Lawrence Avenue East', image: `url(${torontoLawrence3385})` },
]

const Section = styled.section`
  position: relative;
  width: 100vw;
  overflow: hidden;
`

const Row = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;

  @media ${GRID.MEDIA_MOBILE} {
    flex-direction: column;
    height: auto;
  }
`

const Item = styled.div`
  position: relative;
  flex-grow: ${(p) => (p.$active ? 7 : 1)};
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${(p) => p.$image};
  background-size: cover;
  background-position: center;
  transition: flex-grow 1s cubic-bezier(0.16, 1, 0.3, 1);

  @media ${GRID.MEDIA_MOBILE} {
    flex-basis: auto;
    flex-grow: 0;
    height: 45vh;
    min-height: 0;
    cursor: default;
    transition: none;
  }
`

const Info = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  height: clamp(11rem, 16vw, 16rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: clamp(1.5rem, 3vw, 3rem);
  background-color: ${colors.black};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.3s' : '0s')};
  pointer-events: none;

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    opacity: 1;
    transition: none;
  }
`

const Location = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1rem, 2.5vh, 2rem);
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

const Name = styled.h3`
  font-family: 'PP Frama', sans-serif;
  font-weight: 500;
  line-height: 1.05;
  text-transform: uppercase;
  font-size: clamp(1.75rem, 3.2vw, 3.25rem);
  margin: 0;
  text-wrap: pretty;
  max-width: 65%;
  color: ${colors.white};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  transform: translateY(${(p) => (p.$active ? '0' : '1rem')});
  transition:
    opacity ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.6s' : '0s')},
    transform ${(p) => (p.$active ? '0.9s' : '0.3s')} cubic-bezier(0.16, 1, 0.3, 1) ${(p) => (p.$active ? '0.6s' : '0s')};

  @media ${GRID.MEDIA_MOBILE} {
    max-width: none;
    font-size: clamp(1.5rem, 6vw, 2.25rem);
    opacity: 1;
    transform: none;
    transition: none;
  }
`

function Projects() {
  const [active, setActive] = useState(0)

  return (
    <Section>
      <Row onMouseLeave={() => setActive(0)}>
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
              <Name $active={i === active}>{p.name}</Name>
            </Info>
          </Item>
        ))}
      </Row>
    </Section>
  )
}

export default Projects
