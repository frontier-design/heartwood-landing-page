import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID } from '../../../grid'
import { monoCallout, displayHeading, freightBody, colors } from '../../../themes.js'
import { DotField } from '../../../components/dotfield'
import expertiseImage from '../../../assets/images/expertise-image.webp'

gsap.registerPlugin(ScrollTrigger)

// No red in the palette; the field uses the accent so it reads on both the light
// and the dark background.
const DOT_COLOR = colors.teal

// As the wipe uncovers the dark panel, the field animates from a loose scatter
// into three concentric orbits — driven off the same scroll progress via seek().
const RING_OPTS = {
  ringDotCounts: [56, 82, 108],
  minRadius: 0.14,
  maxRadius: 0.42,
  clump: 0.25,
  stray: 0.16,
  jitter: 14,
}

const STATES = [
  { layout: 'scatter', opts: { margin: 0.04, count: 60 } },
  { layout: 'rings', opts: RING_OPTS },
]

// Shared across both panels' fields so they produce the exact same arrangement;
// both are seeked to the same scroll progress, so they read as one field.
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
const Field = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
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
`

// Force a single line with a fixed line box so both panels' eyebrows are the
// exact same height — otherwise the longer string ("A RESILIENT APPROACH") can
// wrap to two lines and push that panel's heading lower than the other's.
const Eyebrow = styled.p`
  ${monoCallout}
  line-height: 1.2;
  white-space: nowrap;
  margin: 0 0 clamp(1rem, 2.5vh, 1.75rem);
  color: ${(p) => (p.$dark ? colors.white : colors.teal)};
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

function Panel({ eyebrow, heading, body, dark, top, layerRef, fieldRef, image }) {
  return (
    <Layer ref={layerRef} $dark={dark} $top={top}>
      {image ? (
        <BgImage $image={image} />
      ) : (
        <Field>
          <DotField
            ref={fieldRef}
            states={STATES}
            seed={FIELD_SEED}
            count={60}
            dotColor={DOT_COLOR}
            dotDiameter={10}
            wander={false}
            cursor
            drift={0}
          />
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
        // Progress drives the resilient-approach field from scatter into rings.
        topFieldRef.current?.seek(self.progress)
      },
    })

    return () => st.kill()
  }, [])

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
          eyebrow="A RESILIENT APPROACH"
          heading="Responsive intelligence and systems-level real estate innovations."
        />
      </Section>
    </Track>
  )
}

export default Approach
