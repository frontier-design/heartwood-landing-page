import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const URL = 'http://localhost:5176'
const OUT = 'scripts/shots'
mkdirSync(OUT, { recursive: true })

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // Wheel down through the whole page like a user, screenshotting each pause.
  let i = 0
  const shot = async (tag) => {
    const y = await page.evaluate(() => Math.round(window.scrollY))
    const name = `${OUT}/${String(i).padStart(2, '0')}-${tag}-y${y}.png`
    await page.screenshot({ path: name })
    i++
    return y
  }

  await shot('load')
  let prevY = -1
  for (let step = 0; step < 40; step++) {
    await page.mouse.wheel(0, 350)
    await page.waitForTimeout(120)
    await page.mouse.wheel(0, 350)
    await page.waitForTimeout(900)
    const y = await shot('down')
    if (y === prevY) break
    prevY = y
  }

  // Then wheel back up.
  for (let step = 0; step < 40; step++) {
    await page.mouse.wheel(0, -350)
    await page.waitForTimeout(120)
    await page.mouse.wheel(0, -350)
    await page.waitForTimeout(900)
    const y = await shot('up')
    if (y === 0) break
  }

  await browser.close()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
