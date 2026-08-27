import { chromium } from "playwright";

const URL = "http://localhost:5175";

const snapshot = () => {
  const secs = [...document.querySelectorAll("section")].map((s) => {
    const r = s.getBoundingClientRect();
    const label = (s.textContent || "")
      .slice(0, 30)
      .trim()
      .replace(/\s+/g, " ");
    const pinned = s.parentElement?.classList.contains("pin-spacer");
    const spacerH = pinned
      ? Math.round(s.parentElement.getBoundingClientRect().height)
      : null;
    return {
      label,
      top: Math.round(r.top + window.scrollY),
      h: Math.round(r.height),
      viewTop: Math.round(r.top),
      pinned: !!pinned,
      spacerH,
      pos: getComputedStyle(s).position,
    };
  });
  return {
    scrollY: Math.round(window.scrollY),
    docH: Math.round(document.documentElement.scrollHeight),
    secs,
  };
};

const fmt = (s) =>
  `y=${s.scrollY} docH=${s.docH}\n` +
  s.secs
    .map(
      (x) =>
        `  [${x.label.padEnd(30)}] top=${String(x.top).padStart(6)} h=${String(x.h).padStart(5)} viewTop=${String(x.viewTop).padStart(6)} pin=${x.pinned ? "Y" : "n"}${x.spacerH ? ` spacer=${x.spacerH}` : ""} pos=${x.pos}`,
    )
    .join("\n");

const run = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewportSize: { width: 1440, height: 900 },
  });
  page.on("console", (m) => {
    if (m.type() === "error") console.log("PAGE ERROR:", m.text());
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  console.log("=== INITIAL ===");
  console.log(fmt(await page.evaluate(snapshot)));

  // Find Pillars pin range: scroll until the EXPERTISE section pins.
  const findTop = async (needle) =>
    page.evaluate((n) => {
      const s = [...document.querySelectorAll("section")].find((el) =>
        el.textContent.includes(n),
      );
      return s
        ? Math.round(s.getBoundingClientRect().top + window.scrollY)
        : null;
    }, needle);

  const pillarsTop = await findTop("EXPERTISE");
  const resilienceTop = await findTop("RESILIENCE");
  console.log("\npillarsTop =", pillarsTop, " resilienceTop =", resilienceTop);

  // Scroll step-wise through Pillars and Resilience, reporting active dot state.
  console.log("\n=== SCROLL SWEEP ===");
  for (let y = pillarsTop - 400; y < resilienceTop + 2200; y += 450) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700);
    const s = await page.evaluate(snapshot);
    const dots = await page.evaluate(() =>
      [...document.querySelectorAll('button[aria-label^="Resilient"]')].map(
        (b) => getComputedStyle(b).opacity,
      ),
    );
    console.log(
      `\n-- target y=${y} -> actual y=${s.scrollY} dots=[${dots.join(",")}]`,
    );
    console.log(fmt(s));
  }

  // Tab switch scenario: scroll to middle of pinned Pillars, click INTELLIGENCE.
  console.log("\n=== TAB SWITCH WHILE PINNED ===");
  await page.evaluate((yy) => window.scrollTo(0, yy), pillarsTop + 300);
  await page.waitForTimeout(800);
  console.log("before click:");
  console.log(fmt(await page.evaluate(snapshot)));
  await page.getByRole("button", { name: "INTELLIGENCE" }).click();
  await page.waitForTimeout(800);
  console.log("\nafter INTELLIGENCE click:");
  console.log(fmt(await page.evaluate(snapshot)));
  await page.getByRole("button", { name: "EXPERTISE" }).click();
  await page.waitForTimeout(800);
  console.log("\nafter EXPERTISE click (back):");
  console.log(fmt(await page.evaluate(snapshot)));

  await browser.close();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
