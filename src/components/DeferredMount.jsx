import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REVEAL_EVENT } from './Loader.jsx'

// Every section image is a CSS background, and browsers request those the
// moment the element exists, so mounting the whole page up front fired ~10MB of
// below-the-fold imagery in parallel with the hero photo, fonts and p5. This
// holds its children back until the Loader has revealed the first screen, then
// mounts them and refreshes ScrollTrigger so triggers sized against the page
// (e.g. the nav's end: 'max') see the new height.
//
// `fallbackMs` guarantees the content appears even if the reveal event never
// fires (Loader unmounted, event missed, etc.).
function DeferredMount({ children, fallbackMs = 5000 }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return
    const go = () => setReady(true)
    window.addEventListener(REVEAL_EVENT, go, { once: true })
    const t = setTimeout(go, fallbackMs)
    return () => {
      window.removeEventListener(REVEAL_EVENT, go)
      clearTimeout(t)
    }
  }, [ready, fallbackMs])

  useEffect(() => {
    if (!ready) return
    // Children have committed; let the browser lay them out, then remeasure.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(raf)
  }, [ready])

  return ready ? children : null
}

export default DeferredMount
