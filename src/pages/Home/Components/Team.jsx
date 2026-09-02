import { useState } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import timBlair from '../../../assets/images/people/tim-blair.webp'
import davidConstable from '../../../assets/images/people/david-constable.webp'
import georgeTheuvenet from '../../../assets/images/people/George Theneuvenet.webp'
import rebekahTobias from '../../../assets/images/people/Rebekah Tobias.webp'
import janeChan from '../../../assets/images/people/Jane Chan.webp'
import dylanKent from '../../../assets/images/people/Dylan Kent.webp'
import carlyForrester from '../../../assets/images/people/Carly Forrester.webp'
import nicolasGreen from '../../../assets/images/people/Nicolas Green.webp'
import geoffreyTurnbull from '../../../assets/images/people/Geoffrey Turnbull.webp'
import jonathanGraham from '../../../assets/images/people/Jonathan Graham.webp'

const MEMBERS = [
  {
    name: 'Tim Blair',
    role: 'FOUNDING PARTNER',
    image: timBlair,
    bio: 'Tim brings 20 years of real estate investment banking and private equity experience, having completed over $8B in transactions for complex commercial and mixed-use residential developments within the Americas and Europe.',
    education: 'Richard Ivey School of Business (MBA)\nUniversity of Waterloo, School of Planning (BES)',
  },
  {
    name: 'David Constable',
    role: 'FOUNDING PARTNER',
    image: davidConstable,
    bio: 'David has over 20 years of experience in international architecture and real estate development, having completed $5B in project design and management, with a priority on low carbon, design excellence.',
    education: 'Rhode Island School of Design\nMcGill University, School of Architecture',
  },
  { name: 'George Theuvenet', role: 'SENIOR ADVISOR', image: georgeTheuvenet },
  { name: 'Rebekah Tobias', role: 'SENIOR ADVISOR', image: rebekahTobias },
  { name: 'Jane Chan', role: 'VICE PRESIDENT, CAPITAL AND CORPORATE DEVELOPMENT', image: janeChan },
  { name: 'Dylan Kent', role: 'DIRECTOR, CAPITAL MARKETS', image: dylanKent },
  { name: 'Carly Forrester', role: 'DIRECTOR, DEVELOPMENT AND PLANNING', image: carlyForrester },
  { name: 'Nicolas Green', role: 'DIRECTOR, CONSTRUCTION', image: nicolasGreen },
  { name: 'Geoffrey Turnbull', role: 'DIRECTOR, INNOVATION AND SUSTAINABILITY', image: geoffreyTurnbull },
  { name: 'Jonathan Graham', role: 'MANAGER, BUILDING PERFORMANCE', image: jonathanGraham },
]

const HAIRLINE = 'rgba(237, 237, 237, 0.14)'

const Section = styled.section`
  position: relative;
  width: 100vw;
  background-color: ${colors.black};
  padding: clamp(3rem, 8vh, 6rem) 0;
`

const Layout = styled(Grid)`
  position: relative;
`

const Intro = styled(GridCell)`
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vh, 1.25rem);
  margin-bottom: clamp(2rem, 5vh, 3.5rem);
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0;
  color: ${colors.teal};
`

const Lede = styled.p`
  ${freightBody}
  margin: 0;
  color: ${colors.white};
`

const List = styled.div`
  grid-column: 1 / -1;
`

const Item = styled.div`
  border-top: 1px solid ${HAIRLINE};

  &:last-child {
    border-bottom: 1px solid ${HAIRLINE};
  }
`

const Row = styled.button`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: ${GRID.GAP}px;
  align-items: center;
  padding: clamp(1.15rem, 3vh, 2rem) 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  @media ${GRID.MEDIA_TABLET} {
    grid-template-columns: repeat(8, 1fr);
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr auto;
    column-gap: clamp(0.5rem, 2vw, 1rem);
  }
`

const Name = styled.span`
  ${displayHeading}
  color: ${colors.white};
  grid-column: 1 / 9;

  @media ${GRID.MEDIA_TABLET} {
    grid-column: 1 / 5;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
    grid-row: 1;
  }
`

const Role = styled.span`
  ${monoCallout}
  color: ${colors.teal};
  grid-column: 9 / 12;
  text-align: left;

  @media ${GRID.MEDIA_TABLET} {
    grid-column: 5 / 8;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
    grid-row: 2;
    margin-top: clamp(0.35rem, 1.2vh, 0.6rem);
  }
`

// Plus that rotates into an × when its row is open.
const Plus = styled.span`
  position: relative;
  justify-self: end;
  width: clamp(22px, 2.2vw, 34px);
  height: clamp(22px, 2.2vw, 34px);

  /* Span both stacked rows (name + role) and stay vertically centred. */
  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 2;
    grid-row: 1 / 3;
    align-self: center;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: ${colors.white};
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &::before {
    transform: translateY(-50%) rotate(${(p) => (p.$open ? '45deg' : '0deg')});
  }
  &::after {
    transform: translateY(-50%) rotate(${(p) => (p.$open ? '135deg' : '90deg')});
  }
`

// Collapsible region — interior content is built later; this only wires the
// open/close interaction so the rows expand.
const Detail = styled.div`
  display: grid;
  grid-template-rows: ${(p) => (p.$open ? '1fr' : '0fr')};
  transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`

const DetailInner = styled.div`
  overflow: hidden;
`

// Interior grid, aligned to the main 12-col grid so the portrait and bio line up
// under the row above. Reveals a portrait (cols 1-3) and a bio + education block.
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: ${GRID.GAP}px;
  padding: 0 0 clamp(2.5rem, 6vh, 4rem);

  @media ${GRID.MEDIA_TABLET} {
    grid-template-columns: repeat(8, 1fr);
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr;
    row-gap: clamp(1.25rem, 3.5vh, 2rem);
  }
`

const Portrait = styled.div`
  grid-column: 1 / 4;
  aspect-ratio: 5 / 6;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_TABLET} {
    grid-column: 1 / 4;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
    aspect-ratio: 4 / 5;
  }
`

const BioColumn = styled.div`
  grid-column: 5 / 9;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vh, 2.75rem);

  @media ${GRID.MEDIA_TABLET} {
    grid-column: 4 / 9;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
  }
`

const Bio = styled.p`
  ${freightBody}
  margin: 0;
  color: ${colors.white};
`

const EduLabel = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(0.5rem, 1.2vh, 0.85rem);
  color: ${colors.teal};
`

const Education = styled.p`
  ${freightBody}
  margin: 0;
  color: ${colors.white};
  white-space: pre-line;
`

function Team() {
  const [open, setOpen] = useState(null)

  return (
    <Section id="team">
      <Layout>
        <Intro $start={1} $span={6} $spanTablet={6} $spanMobile={4}>
          <Eyebrow>OUR TEAM</Eyebrow>
          <Lede>
            Our diverse team of interdisciplinary experts are united by one goal:
            maximizing wealth creation for our investors.
          </Lede>
        </Intro>
        <List>
          {MEMBERS.map((m, i) => {
            const isOpen = open === i
            return (
              <Item key={m.name}>
                <Row
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <Name>{m.name}</Name>
                  <Role>{m.role}</Role>
                  <Plus $open={isOpen} />
                </Row>
                <Detail $open={isOpen}>
                  <DetailInner>
                    <DetailGrid>
                      <Portrait $image={m.image} />
                      <BioColumn>
                        {m.bio && <Bio>{m.bio}</Bio>}
                        {m.education && (
                          <div>
                            <EduLabel>EDUCATION</EduLabel>
                            <Education>{m.education}</Education>
                          </div>
                        )}
                      </BioColumn>
                    </DetailGrid>
                  </DetailInner>
                </Detail>
              </Item>
            )
          })}
        </List>
      </Layout>
    </Section>
  )
}

export default Team
