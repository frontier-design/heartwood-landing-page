import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Grid, GridCell, GRID } from '../../grid'
import { monoCallout, colors } from '../../themes.js'
import Wordmark from '../../assets/images/Heartwood-Wordmark.svg'

gsap.registerPlugin(ScrollTrigger)

// ─── Navigation ──────────────────────────────────────────────────────────────

// Scroll distance over which the nav shrinks from full to compact.
const SHRINK_DISTANCE = 500

const LINKS = [
  { label: 'OUR APPROACH', target: 'approach' },
  { label: 'PROPERTIES', target: 'properties' },
  { label: 'INVESTMENT', target: 'investment' },
  { label: 'OUR TEAM', target: 'team' },
  { label: 'INVESTOR PORTAL', target: null },
]

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: ${(p) => (p.$open ? 'transparent' : colors.gray)};
  transition: background-color 0.2s ease;
  box-shadow: none;
  padding-top: clamp(1.5rem, 3vh, 3rem);
  padding-bottom: clamp(4rem, 10vh, 10rem);

  @media ${GRID.MEDIA_MOBILE} {
    padding-top: 1.5rem;
    padding-bottom: 6rem;
  }
`

const Row = styled.div`
  position: relative;
`

const Logo = styled.img`
  display: block;
  width: 100%;
  height: auto;
  cursor: pointer;
  filter: ${(p) => (p.$open ? 'brightness(0) invert(1)' : 'none')};
  transition: filter 0.2s ease;
`

// Right-aligned links, centred against the wordmark. Hidden on mobile in favour
// of the dot menu; both fade in as the nav shrinks.
const Links = styled.nav`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  gap: clamp(1.5rem, 3vw, 3rem);
  opacity: 0;

  @media ${GRID.MEDIA_MOBILE} {
    display: none;
  }
`

const NavLink = styled.a`
  ${monoCallout}
  font-size: clamp(0.8125rem, 1vw, 1.25rem);
  color: ${colors.black};
  text-decoration: none;
  white-space: nowrap;
`

const MenuDot = styled.button`
  display: none;

  @media ${GRID.MEDIA_MOBILE} {
    display: block;
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: clamp(1.5rem, 6vw, 2rem);
    height: clamp(1.5rem, 6vw, 2rem);
    border: none;
    border-radius: 50%;
    padding: 0;
    background-color: ${(p) => (p.$open ? colors.white : colors.black)};
    transition: background-color 0.2s ease;
    cursor: pointer;
    opacity: 0;
  }
`

// Mobile menu: a black panel that drops from the top of the viewport (40vh) with
// the nav links stacked to its bottom. Toggled by the MenuDot.
const MenuPanel = styled.div`
  display: none;

  @media ${GRID.MEDIA_MOBILE} {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 40vh;
    z-index: 999;
    background-color: ${colors.black};
    padding: 0 ${GRID.PADDING_MOBILE}px clamp(1.75rem, 5vh, 2.75rem);
    transform: translateY(${(p) => (p.$open ? '0' : '-100%')});
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
`

const MenuLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.8vh, 1rem);
`

const MenuLink = styled.a`
  ${monoCallout}
  font-size: clamp(0.8125rem, 3.5vw, 1rem);
  color: ${colors.white};
  text-decoration: none;
`

function Navigation() {
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef(null)
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Smooth-scroll to a section anchor; links without a target (Investor Portal)
  // fall through to their default behaviour.
  const scrollToTarget = (e, target) => {
    if (!target) return
    e.preventDefault()
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }
  // True while the nav is slid out of view, so the ResizeObserver below won't
  // overwrite the collapsed --nav-height back to the full offsetHeight.
  const hiddenRef = useRef(false)

  // Publish the nav's height as a CSS var so fixed-nav offsets stay in sync.
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const setVar = () => {
      if (hiddenRef.current) return
      document.documentElement.style.setProperty('--nav-height', `${el.offsetHeight}px`)
    }

    setVar()

    const ro = new ResizeObserver(setVar)
    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  // Shrink the nav as the page scrolls: the wordmark contracts, the generous
  // padding collapses, and the links (or dot menu on mobile) fade in — all
  // scrubbed against the first SHRINK_DISTANCE of scroll.
  useEffect(() => {
    const build = (endWidth, revealRef, startPad) => {
      const tl = gsap.timeline({
        scrollTrigger: { start: 0, end: SHRINK_DISTANCE, scrub: 0.3 },
      })
      tl.fromTo(logoRef.current, { width: '100%' }, { width: endWidth, ease: 'none' }, 0)
      tl.fromTo(
        navRef.current,
        { paddingTop: startPad.top, paddingBottom: startPad.bottom },
        { paddingTop: '1.25rem', paddingBottom: '1.25rem', ease: 'none' },
        0,
      )
      if (revealRef.current) {
        tl.fromTo(revealRef.current, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0)
      }
    }

    const mm = gsap.matchMedia()
    mm.add(GRID.MEDIA_MOBILE, () => build('30%', menuRef, { top: '1.5rem', bottom: '6rem' }))
    mm.add(`(min-width: ${parseInt(GRID.BREAKPOINT, 10) + 1}px)`, () =>
      build('16%', linksRef, { top: '3rem', bottom: '10rem' }),
    )
    return () => mm.revert()
  }, [])

  // After the landing moment, auto-hide the nav: it slides up out of view when
  // scrolling down and only returns when scrolling back up.
  useEffect(() => {
    const showAnim = gsap
      .from(navRef.current, {
        yPercent: -100,
        duration: 0.4,
        ease: 'power2.out',
        paused: true,
        onUpdate: () => {
          const el = navRef.current
          if (!el) return
          // yPercent runs -100 (hidden) → 0 (shown); map to a 0..1 visible
          // fraction and publish the nav's on-screen height so offsets recenter
          // as it slides.
          const visible = 1 + gsap.getProperty(el, 'yPercent') / 100
          hiddenRef.current = visible < 0.001
          document.documentElement.style.setProperty(
            '--nav-height',
            `${el.offsetHeight * visible}px`,
          )
        },
      })
      .progress(1)

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        // A refresh (e.g. Pillars inserting/removing its pin-spacer on a tab
        // switch) restores scroll position, which reads as an upward scroll and
        // would wrongly reveal the nav over the content. Ignore those.
        if (ScrollTrigger.isRefreshing) return
        if (self.scroll() <= SHRINK_DISTANCE) {
          showAnim.play()
          return
        }
        self.direction === -1 ? showAnim.play() : showAnim.reverse()
      },
    })

    return () => {
      st.kill()
      showAnim.kill()
    }
  }, [])

  return (
    <>
      <MenuPanel $open={menuOpen}>
        <MenuLinks>
          {LINKS.map(({ label, target }) => (
            <MenuLink
              key={label}
              href={target ? `#${target}` : '#'}
              onClick={(e) => scrollToTarget(e, target)}
            >
              {label}
            </MenuLink>
          ))}
        </MenuLinks>
      </MenuPanel>
      <NavBar ref={navRef} $open={menuOpen}>
        <Grid>
          <GridCell $span={12}>
            <Row>
              <Logo
                ref={logoRef}
                $open={menuOpen}
                src={Wordmark}
                alt="Heartwood"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setMenuOpen(false)
                }}
              />
              <Links ref={linksRef}>
                {LINKS.map(({ label, target }) => (
                  <NavLink
                    key={label}
                    href={target ? `#${target}` : '#'}
                    onClick={(e) => scrollToTarget(e, target)}
                  >
                    {label}
                  </NavLink>
                ))}
              </Links>
              <MenuDot
                ref={menuRef}
                $open={menuOpen}
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              />
            </Row>
          </GridCell>
        </Grid>
      </NavBar>
    </>
  )
}

export default Navigation
