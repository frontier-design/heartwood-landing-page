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
  {
    label: 'INVESTOR PORTAL',
    href: 'https://heartwoodsgggfsicom.ciamlogin.com/d1d21c5a-41d2-4232-a196-0483e5082721/oauth2/v2.0/authorize?client_id=cdecab2f-ecd9-451b-bee0-784b42d0498a&redirect_uri=https%3A%2F%2Fheartwood.sgggfsi.com%2Fsign-in-oidc_d1d21c5a-41d2-4232-a196-0483e5082721&response_type=code&scope=openid%20profile%20email%20offline_access&code_challenge=PMPjW27_OwO3JFYTzgCnaAtHWu0n2qyBgVXsjxyhZyc&code_challenge_method=S256&response_mode=form_post&nonce=639239595642975394.OGVjY2RiODUtMzc0Yy00OWQxLTg5YzQtZDQ5NDM2NTAyNTM4NGI2NzRlMzgtOTgxYy00MDQ0LWExZjItOWE2NDQ4NDhhOGQz&client_info=1&x-client-brkrver=IDWeb.3.9.3.0&state=CfDJ8GQBORmZIItNsEoqjvSke39NhuXa9xzxaV-PhJkfWOjz6kHGpxBXW-pD_P2ncSXIc54MKaIHT0-oHERC1DNlGEKWjQeQopJ3yHbWWQD0IYNfhRV-O3T7rGkYFjb7HHtRrTagHrsa-vdkkLNcuIYQ-XjCu5PnAATijlzFJHc2WGlYHqCHTtxUOa_-eH0cdTedyz1PLc1mlB9lreu5BRkmRlNM2NMmPeXXSogSuvGMmNlYYOoRog2fQBf_DyCg1RO7IeEzoOFBAl_xLNsR_ZohY18jmMQgRr4wx-q0rNvooM3DupFEvB21NiYaTgJg-aEVl4Hci91f1iUvd-oVg-xl6xn3ehZt-8zBLPmwN7_f6ztXs5Lnj1jcaHk0Dl665ZnFZSqZbMejVQ9I1bxpAQhECG7Edd-hdBVtlJ4cz_dcQ1-ZUWuoan8D0bx6_NqNMTsCriiIiAUye7V9ggXqhh8k-VdTwzgBnu0lVrXsTqf0_P44bQI9J8MntJYEhFdStlVT4Q&x-client-SKU=ID_NET8_0&x-client-ver=8.12.0.0',
  },
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

  // Smooth-scroll to in-page section anchors; external hrefs navigate normally.
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
          {LINKS.map(({ label, target, href }) => (
            <MenuLink
              key={label}
              href={href ?? (target ? `#${target}` : '#')}
              target={href ? '_blank' : undefined}
              rel={href ? 'noopener noreferrer' : undefined}
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
                {LINKS.map(({ label, target, href }) => (
                  <NavLink
                    key={label}
                    href={href ?? (target ? `#${target}` : '#')}
                    target={href ? '_blank' : undefined}
                    rel={href ? 'noopener noreferrer' : undefined}
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
