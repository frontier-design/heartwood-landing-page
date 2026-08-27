import styled from 'styled-components'
import { Grid, GridCell } from '../../../grid'
import { displayHeading, colors } from '../../../themes.js'

const Section = styled.section`
  width: 100vw;
  background-color: ${colors.black};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: clamp(5rem, 15vh, 15rem) 0;
  color: #ededed;
`

function Intro() {
  return (
    <Section>
      <Grid>
        <GridCell $start={7} $span={6} $startTablet={4} $spanTablet={5}>
          <Heading>
            Heartwood is a next-generation real estate platform focused on
            enduring buildings, healthier homes, stronger communities, and
            durable investment returns.
          </Heading>
        </GridCell>
      </Grid>
    </Section>
  )
}

export default Intro
