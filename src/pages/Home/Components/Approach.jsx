import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID, useMediaQuery } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import { DotField } from '../../../components/dotfield'
import expertiseImage from '../../../assets/images/expertise-image.webp'

gsap.registerPlugin(ScrollTrigger)

// Orange-rust field — the only warm accent in the palette, so the resilient-
// approach dots read against both the light panel and the dark one beneath.
const DOT_COLOR = colors.rust

// "Years held" vs "Return multiple" scatter — an illustrative upward trend the
// engine synthesises (seeded, so it's stable). Brand serif for the labels; rust
// axis/tick text falls out of the dot colour. The subtitle is the disclaimer.
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

// Mobile variant: tighter padding so the axis labels/subtitle sit right under
// the plot instead of leaving a big empty band below (the desktop b:104 reserve
// is far too tall on a short mobile canvas). Smaller dots/type to match.
const SCATTER_PLOT_OPTS_MOBILE = {
  ...SCATTER_PLOT_OPTS,
  diam: 8,
  fontSize: 12,
  yLabelPad: 52,
  maxChartH: 260,
  padding: { l: 68, r: 22, t: 24, b: 66 },
}

// The field runs its own default animation loop, morphing through the story:
// scattered dots → house → investment (scatter plot) → place (pin). The
// scatter-plot step's options are breakpoint-dependent, so the loop is built
// per render.
const buildLoop = (scatterOpts) => [
  { layout: 'scatter', opts: { margin: 0.06, count: 60 } },
  { layout: 'icon', opts: { icon: 'house', size: 0.72 } },
  { layout: 'scatterPlot', opts: scatterOpts },
  { layout: 'icon', opts: { icon: 'locationPin', size: 0.64 } },
]

// How long each arrangement holds before morphing to the next (a full transition
// is ~1.2s, so the remainder is the settle time on each state).
const LOOP_INTERVAL_MS = 3400

// Fixed seed so the field's arrangements stay deterministic across resizes.
const FIELD_SEED = 20240813

/* Two viewports of scroll: the Section sticks for the first one while the wipe
   plays. Sticky (compositor-driven) instead of a GSAP pin — see the note in
   Resilience.jsx. Dark background so any subpixel seam at the end matches the
   uncovered dark panel. */
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

// Both panels are full-viewport layers stacked in the same spot with identical
// layout. The dark one sits underneath; the light one on top is clipped away
// from the bottom as you scroll, uncovering the dark one — a hard wipe, no fade.
const Layer = styled.div`
  position: absolute;
  inset: 0;
  z-index: ${(p) => (p.$top ? 2 : 1)};
  overflow: clip;
  background-color: ${(p) => (p.$dark ? colors.black : colors.gray)};
`

// Each panel carries its OWN dot canvas, sitting between the layer background
// (behind) and the text (in front). Both fields share the same seed and are
// seeked to the same scroll progress, so they render the identical arrangement
// and stay continuous across the wipe while living behind their panel's text.
// Left interactive (no pointer-events:none) so p5 receives the cursor and the
// dots repel on hover — whichever layer is on top at a given region gets it.
// The dot canvas is grid-aligned: it runs from column 5 to 12 (the right two
// thirds), leaving the left columns to the text. Full width on smaller tiers so
// the chart never gets cramped.
const Field = styled(Grid)`
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100%;

  /* Mobile: stack the graph BELOW the compact copy — sit it just under the text
     with only a small bottom margin, so it sits high rather than dropping to the
     bottom of the layer. The tighter mobile chart fills this band evenly. */
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

// The EXPERTISE panel no longer carries a dot canvas — it sits on a full-bleed
// background image instead.
const BgImage = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url(${(p) => p.$image});
  background-size: cover;
  background-position: center;
`

// Text sits above the canvas; pointer-events pass through to the canvas so the
// hover repel works across the whole panel, not just outside the text column.
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

// Force a single line with a fixed line box so both panels' eyebrows are the
// exact same height — otherwise the longer string ("A RESILIENT APPROACH") can
// wrap to two lines and push that panel's heading lower than the other's.
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
  color: ${colors.white};
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
          {body && <Body>{body}</Body>}
        </Column>
      </Content>
    </Layer>
  )
}

function Approach() {
  const trackRef = useRef(null)
  const topRef = useRef(null)
  const topFieldRef = useRef(null)

  // The scatter plot needs a tighter chart on mobile so it doesn't leave a big
  // empty band; pick the matching options and build the loop from them.
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
        // Shrink the light layer from the bottom (its bottom inset grows 0→100%),
        // uncovering the dark layer beneath it. No opacity, just a clip wipe.
        const cut = self.progress * 100
        if (topRef.current) topRef.current.style.clipPath = `inset(0 0 ${cut}% 0)`
      },
    })

    return () => st.kill()
  }, [])

  // The field runs its own default animation loop (independent of scroll),
  // cycling scatter → icon → scatter plot → rings and back.
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
          heading="Vertically integrated, carrying every asset from acquisition to disposition."
          body="The platform was built on a simple belief: a vertically integrated team across working modalities reduces risk. No information is lost at the hand-off between asset phases because every transition is supported by our intelligence and information approach. One team carries every decision through the asset’s full ownership life cycle."
        />
        <Panel
          top
          layerRef={topRef}
          fieldRef={topFieldRef}
          fieldOptions={scatterOpts}
          eyebrow="A RESILIENT APPROACH"
          heading="Responsive intelligence and systems-level real estate innovations."
        />
      </Section>
    </Track>
  )
}

export default Approach
