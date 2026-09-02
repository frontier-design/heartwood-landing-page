import { useEffect } from 'react'
import { GRID, useMediaQuery } from '../grid'

const TRANSPARENT = /^(transparent|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\))$/

function backgroundAt(x, y) {
  let node = document.elementFromPoint(x, y)
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg && !TRANSPARENT.test(bg)) return bg
    node = node.parentElement
  }
  return null
}

function ensureMeta() {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  return meta
}

function ThemeColorSync() {
  const barAtBottom = useMediaQuery(GRID.MEDIA_MOBILE)

  useEffect(() => {
    const meta = ensureMeta()
    let raf = 0

    const sample = () => {
      raf = 0
      const x = window.innerWidth / 2
      // innerHeight tracks Safari's visual viewport as the toolbar collapses,
      // so innerHeight - 1 is always the row of pixels the bar sits against.
      const y = barAtBottom ? window.innerHeight - 1 : 1
      const color = backgroundAt(x, y)
      if (color && meta.content !== color) meta.content = color
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sample)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Non-scroll changes that alter what's under the sample point: the Loader
    // fading out, slide/state driven class swaps. Style attrs are excluded so
    // GSAP's per-frame writes don't churn this.
    const mo = new MutationObserver(schedule)
    mo.observe(document.getElementById('root'), {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mo.disconnect()
    }
  }, [barAtBottom])

  return null
}

export default ThemeColorSync
