import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, colors } from '../../../themes.js'
import performanceImage from '../../../assets/images/performance.webp'

const GOLD = '#b8975a'

const Section = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media ${GRID.MEDIA_MOBILE} {
    height: auto;
    min-height: 100vh;
  }
`

const Top = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  background-color: #f4f4f4;
  padding-top: clamp(2rem, 6vh, 4rem);
  padding-bottom: clamp(2rem, 6vh, 4rem);
  display: flex;
  align-items: center;
`

const Media = styled.div`
  flex: 0 0 clamp(180px, 30vh, 360px);
  background-image: url(${performanceImage});
  background-size: cover;
  background-position: center;

  @media ${GRID.MEDIA_MOBILE} {
    flex-basis: 32vh;
  }
`

const Bottom = styled.div`
  flex: 0 0 auto;
  background-color: ${GOLD};
  padding-block: clamp(2rem, 5vh, 3.5rem);
  display: flex;
  align-items: center;
`

const BandGrid = styled(Grid)`
  width: 100%;
  align-items: center;
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1.5rem, 3vh, 2.5rem);
  color: ${GOLD};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const InvestEyebrow = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1rem, 2.5vh, 2rem);
  color: ${colors.black};
`

const InvestHeading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const FormCell = styled(GridCell)`
  display: flex;
  align-items: center;

  @media ${GRID.MEDIA_MOBILE} {
    margin-top: clamp(1.5rem, 4vh, 2.5rem);
  }
`

const Form = styled.form`
  display: flex;
  width: 100%;
  border: 1px solid rgba(33, 33, 33, 0.45);
`

const Input = styled.input`
  ${monoCallout}
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background-color: #e9e9e9;
  color: ${colors.black};
  padding: clamp(0.9rem, 1.6vw, 1.25rem) clamp(1rem, 1.6vw, 1.5rem);

  &::placeholder {
    color: rgba(33, 33, 33, 0.6);
  }

  &:focus {
    outline: none;
  }
`

const Submit = styled.button`
  ${monoCallout}
  flex: 0 0 auto;
  border: none;
  border-left: 1px solid rgba(33, 33, 33, 0.45);
  background-color: transparent;
  color: ${colors.black};
  padding: 0 clamp(1.25rem, 2vw, 2rem);
  cursor: pointer;
`

function Performance() {
  return (
    <Section>
      <Top>
        <BandGrid>
          <GridCell $start={1} $span={7} $spanTablet={6}>
            <Eyebrow>Performance</Eyebrow>
            <Heading>
              How do we create great value for investors? We build and own
              sustainable, healthy, beautiful buildings that generate accretive
              risk-adjusted investor returns.
            </Heading>
          </GridCell>
        </BandGrid>
      </Top>

      <Media />

      <Bottom>
        <BandGrid>
          <GridCell $start={1} $span={5} $spanTablet={4}>
            <InvestEyebrow>Invest with us</InvestEyebrow>
            <InvestHeading>Build the next generation of real estate with us</InvestHeading>
          </GridCell>
          <FormCell $start={8} $span={5} $startTablet={5} $spanTablet={4}>
            <Form onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder="Enter your email" aria-label="Email" />
              <Submit type="submit">Submit</Submit>
            </Form>
          </FormCell>
        </BandGrid>
      </Bottom>
    </Section>
  )
}

export default Performance
