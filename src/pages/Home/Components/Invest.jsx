import { useState } from 'react'
import styled, { css } from 'styled-components'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, colors } from '../../../themes.js'

const FIELDS = [
  { name: 'name', label: 'NAME*', type: 'text', placeholder: 'Enter your name' },
  { name: 'email', label: 'EMAIL*', type: 'email', placeholder: 'Enter your email' },
]

const FIVE_COLS = `calc((min(${GRID.MAX_WIDTH}px, 100vw) - ${GRID.PADDING * 2 + GRID.GAP * (GRID.COLUMNS - 1)}px) / ${GRID.COLUMNS} * 5 + ${GRID.GAP * 4}px)`

const Section = styled.section`
  position: relative;
  width: 100vw;
  background-color: ${colors.gold};
  padding: clamp(2rem, 5vh, 3.5rem) 0;
`

const Layout = styled(Grid)`
  align-items: start;
  row-gap: clamp(2rem, 5vh, 3.5rem);
`

const Left = styled(GridCell)`
  display: flex;
  flex-direction: column;
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  max-width: ${FIVE_COLS};
  color: ${colors.black};

  @media ${GRID.MEDIA_MOBILE} {
    max-width: none;
  }
`

const Right = styled(GridCell)`
  display: flex;
  flex-direction: column;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2.5vh, 1.75rem);
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1vh, 0.85rem);
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

const Submit = styled.button`
  ${monoCallout}
  align-self: start;
  margin-top: clamp(0.5rem, 1.5vh, 1rem);
  padding: clamp(0.85rem, 1.4vw, 1.15rem) clamp(1.75rem, 3vw, 2.75rem);
  font-size: clamp(0.8rem, 0.95vw, 1rem);
  color: ${colors.white};
  background: ${colors.black};
  border: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

const StatusMsg = styled.p`
  ${monoCallout}
  margin: 0;
  font-size: clamp(0.8rem, 0.9vw, 1rem);
  color: ${(p) => (p.$error ? colors.rust : colors.black)};
`

function Invest() {
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, formType: 'invest' }),
      })
      if (!res.ok) throw new Error('Request failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="investment">
      <Layout>
        <Left $start={1} $span={6} $startTablet={1} $spanTablet={8} $spanMobile={4}>
          <Heading>Own the future of real estate with us.</Heading>
        </Left>
        <Right $start={8} $span={5} $startTablet={1} $spanTablet={8} $spanMobile={4}>
          <Form onSubmit={handleSubmit}>
            {FIELDS.map((f) => (
              <Field key={f.name}>
                <FieldLabel>{f.label}</FieldLabel>
                <Input type={f.type} name={f.name} placeholder={f.placeholder} required />
              </Field>
            ))}
            <Submit type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'SENDING…' : 'LEARN MORE'}
            </Submit>
            {status === 'success' && (
              <StatusMsg>Thank you — we&rsquo;ll be in touch shortly.</StatusMsg>
            )}
            {status === 'error' && (
              <StatusMsg $error>Something went wrong. Please try again.</StatusMsg>
            )}
          </Form>
        </Right>
      </Layout>
    </Section>
  )
}

export default Invest
