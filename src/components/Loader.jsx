import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { colors } from '../themes.js'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: ${colors.white};
  opacity: ${(p) => (p.$loaded ? 0 : 1)};
  pointer-events: ${(p) => (p.$loaded ? 'none' : 'auto')};
  transition: opacity 0.6s ease;
`

// Collect every image the page has rendered so far: <img> sources plus any
// CSS background-image url() (the webp section backgrounds use these).
function collectImageUrls() {
  const urls = new Set()
  document.querySelectorAll('img').forEach((img) => {
    const src = img.currentSrc || img.src
    if (src) urls.add(src)
  })
  document.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage
    if (bg && bg !== 'none') {
      for (const m of bg.matchAll(/url\((['"]?)(.*?)\1\)/g)) urls.add(m[2])
    }
  })
  return [...urls]
}

// Resolve once the image has finished decoding (or failed — we never block
// forever on a single broken asset).
function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
    img.decode?.().then(resolve, () => {})
  })
}

function Loader() {
  const [loaded, setLoaded] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    const reveal = () => {
      if (!cancelled) setLoaded(true)
    }

    // Wait for the things that actually make the page presentable:
    //  1. web fonts (PP Frama / mono / freight) so text doesn't reflow,
    //  2. the p5 chunk (~900KB, dynamically imported by DotField) so the
    //     canvases hydrate the instant we reveal instead of popping in,
    //  3. all currently-rendered images decoded (webp section backgrounds).
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      import('p5').catch(() => {}),
      new Promise((resolve) => {
        // Let React commit + paint so the images/backgrounds exist in the DOM,
        // then preload/decode them all.
        requestAnimationFrame(() =>
          requestAnimationFrame(async () => {
            await Promise.all(collectImageUrls().map(preloadImage))
            resolve()
          }),
        )
      }),
    ])

    // Safety cap: never trap the user behind the overlay if an asset stalls.
    const safety = setTimeout(reveal, 8000)
    ready.then(() => {
      clearTimeout(safety)
      reveal()
    })

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [])

  if (hidden) return null

  return (
    <Overlay
      $loaded={loaded}
      aria-hidden
      onTransitionEnd={() => loaded && setHidden(true)}
    />
  )
}

export default Loader
