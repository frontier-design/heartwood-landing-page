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

export const REVEAL_EVENT = 'heartwood:revealed'

function inViewport(el) {
  const r = el.getBoundingClientRect()
  return (
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > 0 &&
    r.right > 0 &&
    r.top < window.innerHeight &&
    r.left < window.innerWidth
  )
}

// Collect the images the user will actually see at reveal: <img> sources and
// CSS background-image url()s, but only on elements intersecting the initial
// viewport. Gating on every image on the page held the overlay up until all
// section backgrounds (~11MB) had decoded.
function collectImageUrls() {
  const urls = new Set()
  document.querySelectorAll('img').forEach((img) => {
    const src = img.currentSrc || img.src
    if (src && inViewport(img)) urls.add(src)
  })
  document.querySelectorAll('*').forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage
    if (bg && bg !== 'none' && inViewport(el)) {
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
    let revealed = false
    const reveal = () => {
      if (cancelled || revealed) return
      revealed = true
      setLoaded(true)
      window.dispatchEvent(new Event(REVEAL_EVENT))
    }

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      import('p5').catch(() => {}),
      new Promise((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(async () => {
            await Promise.all(collectImageUrls().map(preloadImage))
            resolve()
          }),
        )
      }),
    ])

    // Safety cap: never trap the user behind the overlay if an asset stalls.
    const safety = setTimeout(reveal, 4000)
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
