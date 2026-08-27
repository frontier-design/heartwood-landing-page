import { useEffect, useRef } from 'react'
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

const LINKS = ['OUR APPROACH', 'PROJECTS', 'PERFORMANCE', 'INVESTOR PORTAL']

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: ${colors.gray};
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
    background-color: ${colors.black};
    cursor: pointer;
    opacity: 0;
  }
`

function Navigation() {
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef(null)
  const menuRef = useRef(null)

  // Publish the nav's height as a CSS var so fixed-nav offsets stay in sync.
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const setVar = () => {
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
      })
      .progress(1)

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
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
    <NavBar ref={navRef}>
      <Grid>
        <GridCell $span={12}>
          <Row>
            <Logo ref={logoRef} src={Wordmark} alt="Heartwood" />
            <Links ref={linksRef}>
              {LINKS.map((label) => (
                <NavLink key={label} href="#">
                  {label}
                </NavLink>
              ))}
            </Links>
            <MenuDot ref={menuRef} type="button" aria-label="Open menu" />
          </Row>
        </GridCell>
      </Grid>
    </NavBar>
  )
}

export default Navigation
