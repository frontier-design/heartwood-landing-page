import { chromium } from "playwright";
import { mkdirSync } from "fs";

const URL = "http://localhost:5176";
const OUT = "scripts/shots-tabs";
mkdirSync(OUT, { recursive: true });

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  let i = 0;
  const shot = async (tag) => {
    const y = await page.evaluate(() => Math.round(window.scrollY));
    await page.screenshot({
      path: `${OUT}/${String(i).padStart(2, "0")}-${tag}-y${y}.png`,
    });
    i++;
  };
  const click = (name) =>
    page.getByRole("button", { name, exact: true }).click();

  // Scenario A: section pinned at its start (clean state), click through tabs.
  await page.evaluate(() => window.scrollTo(0, 3296));
  await page.waitForTimeout(900);
  await shot("A-expertise-pinned-start");
  await click("INTELLIGENCE");
  await page.waitForTimeout(900);
  await shot("A-intelligence");
  await click("INNOVATION");
  await page.waitForTimeout(900);
  await shot("A-innovation");
  await click("EXPERTISE");
  await page.waitForTimeout(900);
  await shot("A-back-to-expertise");

  // Scenario B: pinned midway (progress ~0.5), click INTELLIGENCE then back.
  await page.evaluate(() => window.scrollTo(0, 3618));
  await page.waitForTimeout(900);
  await shot("B-expertise-pinned-mid");
  await click("INTELLIGENCE");
  await page.waitForTimeout(900);
  await shot("B-intelligence-after-click");
  await click("EXPERTISE");
  await page.waitForTimeout(900);
  await shot("B-back-to-expertise");
  // then scroll a bit to see state
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(900);
  await shot("B-after-small-scroll");

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
