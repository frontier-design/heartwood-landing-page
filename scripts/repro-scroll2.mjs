import { chromium } from 'playwright'

const URL = 'http://localhost:5176'

const getTriggers = async (page) =>
  page.evaluate(async () => {
    if (!window.__ST) {
      const src = await (await fetch('/src/pages/Home/Components/Resilience.jsx')).text()
      const m = src.match(/from\s+"([^"]*gsap_ScrollTrigger[^"]*)"/)
      window.__ST = (await import(m[1])).ScrollTrigger
    }
    const ScrollTrigger = window.__ST
    return ScrollTrigger.getAll().map((t) => ({
      start: Math.round(t.start),
      end: Math.round(t.end),
      pin: !!t.pin,
      trig: t.trigger
        ? (t.trigger.textContent || '').slice(0, 24).trim().replace(/\s+/g, ' ')
        : null,
      progress: +t.progress.toFixed(3),
    }))
  })

const domTops = async (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('section')].map((s) => ({
      label: (s.textContent || '').slice(0, 24).trim().replace(/\s+/g, ' '),
      top: Math.round(s.getBoundingClientRect().top + window.scrollY),
      spacer: s.parentElement?.classList.contains('pin-spacer')
        ? Math.round(s.parentElement.getBoundingClientRect().height)
        : null,
    })),
  )

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  console.log('=== TRIGGERS AFTER LOAD ===')
  console.log(await getTriggers(page))
  console.log(await domTops(page))

  // scroll into the pinned Pillars range (start per trigger data below)
  const pillars = (await getTriggers(page)).find((t) => t.pin && t.trig?.includes('EXPERTISE'))
  const mid = Math.round((pillars.start + pillars.end) / 2)
  await page.evaluate((y) => window.scrollTo(0, y), mid)
  await page.waitForTimeout(600)
  console.log(`\n=== PINNED MID-PILLARS y=${mid} ===`)
  console.log('scrollY =', await page.evaluate(() => window.scrollY))

  await page.getByRole('button', { name: 'INTELLIGENCE' }).click()
  await page.waitForTimeout(900)
  console.log('\n=== AFTER INTELLIGENCE CLICK ===')
  console.log('scrollY =', await page.evaluate(() => window.scrollY))
  console.log(await getTriggers(page))
  console.log(await domTops(page))

  await page.getByRole('button', { name: 'EXPERTISE' }).click()
  await page.waitForTimeout(900)
  console.log('\n=== AFTER EXPERTISE CLICK (BACK) ===')
  console.log('scrollY =', await page.evaluate(() => window.scrollY))
  console.log(await getTriggers(page))
  console.log(await domTops(page))

  // Now wheel-scroll from above Resilience down through it, watching snap.
  const res = (await getTriggers(page)).find((t) => t.pin && t.trig?.includes('RESILIENCE'))
  console.log('\n=== WHEEL THROUGH RESILIENCE ===', res)
  await page.evaluate((y) => window.scrollTo(0, y), res.start - 300)
  await page.waitForTimeout(800)
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(150)
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(1200) // let snap settle
    const y = await page.evaluate(() => window.scrollY)
    const dots = await page.evaluate(() =>
      [...document.querySelectorAll('button[aria-label^="Resilient"]')]
        .map((b) => getComputedStyle(b).opacity)
        .join(','),
    )
    const p = ((y - res.start) / (res.end - res.start)).toFixed(3)
    console.log(`wheel#${i}: y=${Math.round(y)} progress=${p} dots=[${dots}]`)
  }

  await browser.close()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
