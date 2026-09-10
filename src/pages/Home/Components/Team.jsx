import { useState } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import timBlair from '../../../assets/images/people/Tim.webp'
import davidConstable from '../../../assets/images/people/David.webp'
import georgeTheuvenet from '../../../assets/images/people/George.webp'
import rebekahTobias from '../../../assets/images/people/Rebekah.webp'
import dylanKent from '../../../assets/images/people/Dylan_Kent.webp'
import cole from '../../../assets/images/people/Cole.webp'
import dylan from '../../../assets/images/people/Dylan.webp'
import jordan from '../../../assets/images/people/Jordan.webp'
import matt from '../../../assets/images/people/Matt.webp'
import mikeFreeland from '../../../assets/images/people/Mike_Freeland.webp'
import mikeP from '../../../assets/images/people/Mike_P.webp'

const MEMBERS = [
  {
    name: 'David Constable',
    role: 'FOUNDING PARTNER',
    image: davidConstable,
    bio: 'David brings over 20 years of experience in international architecture and real estate development, having led $5B in project design and management with a focus on low-carbon, design-forward outcomes.',
    education: 'Rhode Island School of Design\nMcGill University, School of Architecture',
  },
  {
    name: 'Tim Blair',
    role: 'FOUNDING PARTNER',
    image: timBlair,
    bio: 'Tim brings 20 years of experience in real estate investment banking and private equity, having completed over $8B in transactions across complex commercial and mixed-use residential developments in the Americas and Europe.',
    education: 'Richard Ivey School of Business (MBA)\nUniversity of Waterloo, School of Planning (BES)',
  },
  {
    name: 'Nathan Helbach',
    role: 'UNITED STATES',
    bio: "Nathan brings 10 years of experience in real estate development and investing, having delivered over 2,200 multifamily units in the United States and several large-scale mass timber buildings in North America, with a focus on expanding Heartwood's strategy into the United States.",
  },
  {
    name: 'George Theuvenet',
    role: 'SENIOR ADVISOR',
    image: georgeTheuvenet,
    bio: 'George brings over 30 years of experience in financial institutions, real estate, investor relations, and capital raising, with a strong track record building and sustaining long-term relationships across international institutional markets.',
    education: 'LLM, Erasmus University, Rotterdam\nJD, Fordham University, NYC\nExecutive Education at Columbia, Kellogg, Berkeley, Stanford',
  },
  {
    name: 'Rebekah Tobias',
    role: 'SENIOR ADVISOR',
    image: rebekahTobias,
    bio: 'Rebekah brings over 20 years of experience in real estate and investment, advising Heartwood on resilient European real estate strategies and drawing on deep relationships across European family offices and capital-raising networks.',
    education: 'MSc, Real Estate, Kingston University, UK\nBA in English, San Diego State University',
  },
  {
    name: 'Richard Crofts',
    role: 'SENIOR ADVISOR',
    bio: 'Richard brings a 25+-year track record structuring and launching investment vehicles and leading complex mergers, acquisitions, and cross-border transactions. He holds the Chartered Investment Manager (CIM) designation, is a Fellow of the Canadian Securities Institute (FCSI), and was previously recognized as a "Top 40 Under 40" lawyer called to the Bar in New York State and Ontario.',
  },
  {
    name: 'Cheryl Gray',
    role: 'SENIOR ADVISOR',
    bio: "Cheryl brings decades of institutional real estate management experience, helping clients strengthen organizational structure, sustainability initiatives, risk mitigation, and prop-tech implementation across all major asset classes. She has led corporate-wide programs and new business initiatives that translate macro-level strategy into practical execution, earning recognition including the BOMA Canada Chairman's Award, the REIC Emeritus Award, and GlobeSt's Real Estate Women of Influence Innovator of the Year Award.",
  },
  {
    name: 'Dylan Kent',
    role: 'DIRECTOR, CAPITAL MARKETS',
    image: dylanKent,
    bio: 'Dylan brings over 10 years of experience in real estate capital markets across large institutions, boutique investment firms, and large-scale developers, with an entrepreneurial track record spanning startups and ventures in real estate, prop-tech, and sports & entertainment.',
    education: 'FINRA Certifications, CSC\nB.Sc., University of Maryland Baltimore County',
  },
  {
    name: 'Dustin Buenaventura',
    role: 'DIRECTOR, BUSINESS DEVELOPMENT',
    bio: 'Dustin brings over a decade of experience in Canadian financial services and business development, including senior roles at Equiton, Brompton Funds, Horizons ETFs, and Sun Life Global Investments, with deep expertise across private equity, ETFs, wealth management, and alternative investments.',
  },
  { name: 'Kristopher Tavella', role: 'VICE PRESIDENT, DEVELOPMENT AND INVESTMENTS' },
  { name: 'Adam Morgan', role: 'ASSOCIATE, DEVELOPMENT AND INVESTMENTS' },
  { name: 'Mike Prapavessis', role: 'ASSOCIATE, DEVELOPMENT AND INVESTMENTS', image: mikeP },
  { name: 'Cole Cameron', role: 'ANALYST, DEVELOPMENT AND INVESTMENTS', image: cole },
  { name: 'Matthew Sardellitti', role: 'ANALYST, DEVELOPMENT AND INVESTMENTS', image: matt },
  {
    name: 'Jordan Winter',
    role: 'VICE PRESIDENT, FINANCE & ACCOUNTING',
    image: jordan,
    bio: '10+ years in corporate finance, real estate, and accounting.',
    education: 'CPA, CA\nMMPA University of Toronto\nBA (Economics), University of Western Ontario',
  },
  { name: 'Jude Siby', role: 'SENIOR ACCOUNTANT' },
  { name: 'Jonathan Graham', role: 'MANAGER, BUILDING PERFORMANCE' },
  { name: 'Dylan Delli Colli', role: 'DATA SCIENCE LEAD', image: dylan },
  { name: 'Mike Freeland', role: 'SENIOR PM, CONSTRUCTION', image: mikeFreeland },
  { name: 'Nic Green', role: '' },
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
            Our team brings together specialists from across real estate, each
            with deep experience in their disciplines.
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
                      {m.image && <Portrait $image={m.image} />}
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
