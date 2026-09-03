import styled, { css } from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, colors } from '../../../themes.js'

const FIELDS = [
  { name: 'name', label: 'NAME*', type: 'text', placeholder: 'Enter your name' },
  { name: 'email', label: 'EMAIL*', type: 'email', placeholder: 'Enter your email' },
  { name: 'company', label: 'COMPANY', type: 'text', placeholder: 'Enter your company name' },
  { name: 'phone', label: 'PHONE', type: 'tel', placeholder: 'Enter your phone number' },
]

const Section = styled.section`
  position: relative;
  width: 100vw;
  background-color: ${colors.gray};
  padding: clamp(3rem, 8vh, 6rem) 0;

  @media ${GRID.MEDIA_MOBILE} {
    padding-top: 0;
  }
`

const Layout = styled(Grid)`
  position: relative;
  align-items: stretch;
`

const Left = styled(GridCell)`
  display: flex;
  flex-direction: column;
  padding-top: clamp(2rem, 6vh, 4rem);
  padding-right: 100px;

  @media ${GRID.MEDIA_MOBILE} {
    padding-right: 0;
  }
`

const Panel = styled(GridCell)`
  display: flex;
  flex-direction: column;
  background-color: ${colors.gold};
  padding: clamp(2rem, 4vw, 4.5rem);

  @media ${GRID.MEDIA_MOBILE} {
    margin-top: clamp(1rem, 3vh, 1.75rem);
  }
`

const Eyebrow = styled.p`
  ${monoCallout}
  margin: 0 0 clamp(1rem, 2.5vh, 1.75rem);
  color: ${(p) => p.$color};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${colors.black};
`

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1rem, 2vh, 1.75rem) clamp(1rem, 2vw, 2rem);
  margin-top: clamp(2rem, 5vh, 3.5rem);

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vh, 0.85rem);
  ${(p) => p.$full && 'grid-column: 1 / -1;'}
`

const FieldLabel = styled.span`
  ${monoCallout}
  color: ${colors.black};
  font-size: clamp(0.8rem, 0.95vw, 1rem);
`

const control = css`
  ${monoCallout}
  width: 100%;
  color: ${colors.black};
  background: #ffffff;
  border: 1px solid rgba(33, 33, 33, 0.15);
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.7rem, 1.1vw, 0.95rem);
  font-size: clamp(0.8rem, 0.9vw, 1rem);
  outline: none;

  &::placeholder {
    color: rgba(33, 33, 33, 0.35);
  }

  &:focus {
    border-color: ${colors.black};
  }
`

const Input = styled.input`
  ${control}
`

const TextArea = styled.textarea`
  ${control}
  min-height: clamp(9rem, 18vh, 12rem);
  resize: vertical;
`

const Submit = styled.button`
  ${monoCallout}
  grid-column: 1 / -1;
  justify-self: start;
  margin-top: clamp(0.5rem, 1.5vh, 1rem);
  padding: clamp(0.85rem, 1.4vw, 1.15rem) clamp(1.75rem, 3vw, 2.75rem);
  font-size: clamp(0.8rem, 0.95vw, 1rem);
  color: ${colors.white};
  background: ${colors.black};
  border: none;
  cursor: pointer;
`

function Invest() {
  return (
    <Section id="investment">
      <Layout>
        <Left $start={1} $span={6} $startTablet={1} $spanTablet={8} $spanMobile={4}>
          <Eyebrow $color={colors.gold}>INVESTMENT</Eyebrow>
          <Heading>
            How do we create great value for investors? We build and own
            sustainable, healthy, beautiful buildings that generate accretive
            risk-adjusted investor returns.
          </Heading>
        </Left>
        <Panel $start={7} $span={6} $startTablet={1} $spanTablet={8} $spanMobile={4}>
          <Eyebrow $color={colors.black}>INVEST WITH US</Eyebrow>
          <Heading>Build the next generation of real estate with us.</Heading>
          {/* Not wired to a backend — presentational only. */}
          <Form onSubmit={(e) => e.preventDefault()}>
            {FIELDS.map((f) => (
              <Field key={f.name}>
                <FieldLabel>{f.label}</FieldLabel>
                <Input type={f.type} name={f.name} placeholder={f.placeholder} />
              </Field>
            ))}
            <Field $full>
              <FieldLabel>MESSAGE</FieldLabel>
              <TextArea
                name="message"
                placeholder="Tell us what you're looking for. We'll reach out with details on our approach"
              />
            </Field>
            <Submit type="submit">LEARN MORE</Submit>
          </Form>
        </Panel>
      </Layout>
    </Section>
  )
}

export default Invest
