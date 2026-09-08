import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID, useMediaQuery } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import { DotField } from '../../../components/dotfield'
import expertiseImage from '../../../assets/images/expertise-image.webp'

gsap.registerPlugin(ScrollTrigger)

const DOT_COLOR = colors.rust

const SCATTER_PLOT_OPTS = {
  count: 68,
  xMin: 1,
  xMax: 10,
  yMin: 1,
  yMax: 3,
  xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  yTicks: [1, 1.5, 2, 2.5, 3],
  xLabel: 'Years held',
  yLabel: 'Return multiple',
  formatX: (v) => String(v),
  formatY: (v) => `${v.toFixed(1)}x`,
  subtitle: 'Illustrative only. Not a forecast or guarantee of performance.',
  diam: 10,
  font: "'PP Right Serif Mono', monospace",
  fontSize: 14,
  maxChartW: 620,
  maxChartH: 320,
  yLabelPad: 78,
  padding: { l: 108, r: 40, t: 40, b: 104 },
}

const SCATTER_PLOT_OPTS_MOBILE = {
  ...SCATTER_PLOT_OPTS,
  diam: 8,
  fontSize: 12,
  yLabelPad: 52,
  maxChartH: 260,
  padding: { l: 68, r: 22, t: 24, b: 66 },
}

const buildLoop = (scatterOpts) => [
  { layout: 'scatter', opts: { margin: 0.06, count: 60 } },
  { layout: 'icon', opts: { icon: 'house', size: 0.72 } },
  { layout: 'scatterPlot', opts: scatterOpts },
  { layout: 'icon', opts: { icon: 'locationPin', size: 0.64 } },
]

const LOOP_INTERVAL_MS = 3400

const FIELD_SEED = 20240813

const Track = styled.div`
  position: relative;
  height: calc(100vh * 2);
  height: calc(100lvh * 2);
  background-color: ${colors.black};
`

const Section = styled.section`
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  height: 100lvh;
  overflow: clip;
`

const Layer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${(p) => (p.$top ? 2 : 1)};
  overflow: clip;
  background-color: ${(p) => (p.$dark ? colors.black : colors.gray)};
`

const Field = styled(Grid)`
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100%;

  @media ${GRID.MEDIA_MOBILE} {
    top: 30%;
    bottom: 6%;
    height: auto;
  }
`

const FieldCell = styled(GridCell)`
  position: relative;
  height: 100%;
`

const BgImage = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;
`

const Content = styled(Grid)`
  position: relative;
  z-index: 1;
  height: 100%;
  pointer-events: none;
`

const Column = styled(GridCell)`
  padding-top: clamp(4rem, 12vh, 9rem);

  @media ${GRID.MEDIA_MOBILE} {
    padding-top: clamp(2rem, 6vh, 3.5rem);
  }
`

const Eyebrow = styled.p`
  ${monoCallout}
  line-height: 1.2;
  white-space: nowrap;
  margin: 0 0 clamp(1rem, 2.5vh, 1.75rem);
  color: ${(p) => (p.$dark ? colors.white : colors.rust)};
`

const Heading = styled.h2`
  ${displayHeading}
  margin: 0;
  color: ${(p) => (p.$dark ? colors.white : colors.black)};
`

const Body = styled.p`
  ${freightBody}
  margin: clamp(1.5rem, 3vh, 2.25rem) 0 0;
  color: ${(p) => (p.$dark ? colors.white : colors.black)};
  text-wrap: balance;
`

function Panel({ eyebrow, heading, body, dark, top, layerRef, fieldRef, image, fieldOptions }) {
  return (
    <Layer ref={layerRef} $dark={dark} $top={top}>
      {image ? (
        <BgImage $image={image} />
      ) : (
        <Field>
          <FieldCell $start={5} $span={8} $startTablet={1} $spanTablet={8}>
            <DotField
              ref={fieldRef}
              layout="scatterPlot"
              layoutOptions={fieldOptions}
              seed={FIELD_SEED}
              count={60}
              dotColor={DOT_COLOR}
              dotDiameter={10}
              wander={false}
              cursor
              drift={0}
              responsive={false}
            />
          </FieldCell>
        </Field>
      )}
      <Content>
        <Column $start={1} $span={5} $spanTablet={6} $spanMobile={4}>
          <Eyebrow $dark={dark}>{eyebrow}</Eyebrow>
          <Heading $dark={dark}>{heading}</Heading>
          {body && <Body $dark={dark}>{body}</Body>}
        </Column>
      </Content>
    </Layer>
  )
}

function Approach() {
  const trackRef = useRef(null)
  const topRef = useRef(null)
  const topFieldRef = useRef(null)

  const isMobile = useMediaQuery(GRID.MEDIA_MOBILE)
  const scatterOpts = isMobile ? SCATTER_PLOT_OPTS_MOBILE : SCATTER_PLOT_OPTS
  const loop = useMemo(() => buildLoop(scatterOpts), [scatterOpts])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const cut = self.progress * 100
        if (topRef.current) topRef.current.style.clipPath = `inset(0 0 ${cut}% 0)`
      },
    })

    return () => st.kill()
  }, [])

  useEffect(() => {
    let i = 0
    const advance = () => {
      i = (i + 1) % loop.length
      const step = loop[i]
      topFieldRef.current?.setLayout(step.layout, step.opts)
    }
    const id = setInterval(advance, LOOP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [loop])

  return (
    <Track id="approach" ref={trackRef}>
      <Section>
        <Panel
          dark
          image={expertiseImage}
          eyebrow="EXPERTISE"
          heading="Vertically integrated, from acquisition to disposition."
          body="Investing, building, and actively managing to create value and reduce risk. Specialists in each discipline working side by side, on shared systems, maintaining consistency throughout the life cycle. One integrated team, united by one goal: to protect and grow investor capital and deliver durable returns."
        />
        <Panel
          top
          layerRef={topRef}
          fieldRef={topFieldRef}
          fieldOptions={scatterOpts}
          eyebrow="A RESILIENT APPROACH"
          heading="Responsive intelligence and systems-level real estate innovations."
          body="Our platform integrates real estate expertise, data intelligence and a drive toward innovation."
        />
      </Section>
    </Track>
  )
}

export default Approach
