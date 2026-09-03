import chartPresets from "./chart-presets.json" with { type: "json" };

export { chartPresets };

function withPreset(preset, opts) {
  return {
    ...preset,
    ...opts,
    padding: { ...preset.padding, ...opts.padding },
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Box–Muller on the seeded PRNG (stands in for p5.randomGaussian).
function gaussian(random, mean = 0, sd = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = random();
  while (v === 0) v = random();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function ticks(min, max, step) {
  const out = [];
  for (let v = min; v <= max + 1e-9; v += step)
    out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

// Uniform scale that fits a natural (px) footprint inside the canvas minus
// the label padding. Never scales up unless the caller asks via opts.scale.
function fitScale(naturalW, naturalH, w, h, pad, opts) {
  const user = opts.scale ?? 1;
  if (opts.fit === false) return user;
  const availW = Math.max(1, w - pad.l - pad.r);
  const availH = Math.max(1, h - pad.t - pad.b);
  return (
    Math.min(
      1,
      availW / Math.max(1, naturalW),
      availH / Math.max(1, naturalH),
    ) * user
  );
}

// Centre of the dot area, shifted so the chart *plus its labels* is centred.
function centre(w, h, pad, opts) {
  return {
    cx: opts.cx ?? w / 2 + (pad.l - pad.r) / 2,
    cy: opts.cy ?? h / 2 + (pad.t - pad.b) / 2,
  };
}

function textOpts(opts) {
  const o = {};
  if (opts.font) o.font = opts.font;
  if (opts.fontSize) o.fontSize = opts.fontSize;
  if (opts.textColor) o.textColor = opts.textColor;
  return o;
}

// ─── Bar chart (stacked, "TEUI vs utility cost") ─────────────────────────────
// Each bar is a `barCols`-wide column of dots; rows below `base` are dimmed.
//   bars      — [{ label, total, base }] in data units
//   yMin/yMax — data range mapped onto `rows` dot rows
//   barCols   — dots across each bar (default 5)
//   diam, gap — dot size / spacing (default 10 / 3)
//   dimAlpha  — alpha of the base segment (default 100)
//   yTicks | yStep, yLabel, legend: [fullLabel, dimLabel]
export function barChartLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.barChart, opts);
  const bars = p.bars;
  const yMin = p.yMin;
  const yMax = p.yMax;
  const rows = p.rows;
  const barCols = p.barCols;
  const dimAlpha = p.dimAlpha;
  const pad = p.padding;

  const unit = p.diam + p.gap;
  const nBarW = (barCols - 1) * unit;
  const nGap = unit * 2.5;
  const naturalW = bars.length * nBarW + (bars.length - 1) * nGap;
  const naturalH = (rows - 1) * unit;
  const s = fitScale(naturalW, naturalH, w, h, pad, p);

  const diam = p.diam * s;
  const sp = unit * s;
  const barW = nBarW * s;
  const barGap = nGap * s;
  const gridW = naturalW * s;
  const gridH = naturalH * s;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - gridW / 2;
  const baseY = cy + gridH / 2;
  const perRow = (yMax - yMin) / rows;

  const positions = [];
  const barCenters = [];
  bars.forEach((bar, bi) => {
    const bx = ox + bi * (barW + barGap);
    barCenters.push(bx + barW / 2);
    const totalRows = clamp(Math.round((bar.total - yMin) / perRow), 0, rows);
    const baseRows = clamp(
      Math.round((bar.base - yMin) / perRow),
      0,
      totalRows,
    );
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < barCols; col++) {
        positions.push({
          x: bx + col * sp,
          y: baseY - row * sp,
          alpha: row < baseRows ? dimAlpha : 255,
          diam,
        });
      }
    }
  });

  const layout = {
    overlay: "barChart",
    ox,
    oy: baseY - gridH,
    baseY,
    gridW,
    gridH,
    spacing: sp,
    diam,
    cols: bars.length,
    rows,
    barCenters,
    colLabels: bars.map((b) => b.label),
    dimAlpha,
    yMin,
    yMax,
    yTicks: p.yTicks ?? ticks(yMin, yMax, p.yStep),
    yLabel: p.yLabel,
    legend: p.legend,
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Simple bars (grid of cols × rows, filled from the bottom) ───────────────
//   cols, rows — grid dimensions (default 10 × 10)
//   values     — bar heights in rows (0..rows); random when omitted
//   labels     — column labels (default month names)
//   diam, gap  — dot size / spacing (default 20 / 6)
//   dimAlpha   — alpha of the unfilled cells (default 51)
//   legend     — [filledLabel, dimLabel]
export function simpleBarsLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.simpleBars, opts);
  const random = p.rand ?? Math.random;
  const cols = p.cols;
  const rows = p.rows;
  const dimAlpha = p.dimAlpha;
  const pad = p.padding;

  const unit = p.diam + p.gap;
  const naturalW = (cols - 1) * unit;
  const naturalH = (rows - 1) * unit;
  const s = fitScale(naturalW, naturalH, w, h, pad, p);
  const diam = p.diam * s;
  const spacing = unit * s;
  const gridW = naturalW * s;
  const gridH = naturalH * s;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - gridW / 2;
  const oy = cy - gridH / 2;

  const heights = Array.from({ length: cols }, (_, c) => {
    const v = p.values?.[c];
    return v == null
      ? Math.floor(random() * rows) + 1
      : clamp(Math.round(v), 0, rows);
  });

  const positions = [];
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rowFromBottom = rows - 1 - row;
    positions.push({
      x: ox + col * spacing,
      y: oy + row * spacing,
      alpha: rowFromBottom < heights[col] ? 255 : dimAlpha,
      diam,
    });
  }

  const layout = {
    overlay: "simpleBars",
    ox,
    oy,
    cols,
    rows,
    spacing,
    diam,
    gridW,
    gridH,
    colLabels: p.labels ?? chartPresets.months.slice(0, cols),
    dimAlpha,
    legend: p.legend,
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Heatmap (calendar-style, column-major) ──────────────────────────────────
//   rows      — cells per column (default 7 = days)
//   cols      — columns; derived from `cells` (default 240) when omitted
//   values    — per-cell intensity 0..1 (column-major); random when omitted
//   levels, weights — discrete alpha levels and their pick weights
//   diam, gap — dot size / spacing (default 14 / 3)
//   rowLabels, colLabels — defaults: Mon/Wed/Fri/Sun and month names
//   legend    — [lowLabel, highLabel]
export function heatmapLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.heatmap, opts);
  const random = p.rand ?? Math.random;
  const rows = p.rows;
  const cols = p.cols ?? Math.ceil(p.cells / rows);
  const levels = p.levels;
  const weights = p.weights;
  const pad = p.padding;

  const unit = p.diam + p.gap;
  const naturalW = (cols - 1) * unit;
  const naturalH = (rows - 1) * unit;
  const s = fitScale(naturalW, naturalH, w, h, pad, p);
  const diam = p.diam * s;
  const spacing = unit * s;
  const gridW = naturalW * s;
  const gridH = naturalH * s;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - gridW / 2;
  const oy = cy - gridH / 2;

  const lo = levels[0];
  const hi = levels[levels.length - 1];
  const pickLevel = () => {
    const r = random();
    let cum = 0;
    for (let l = 0; l < weights.length; l++) {
      cum += weights[l];
      if (r < cum) return levels[l];
    }
    return hi;
  };

  const total = cols * rows;
  const positions = [];
  for (let i = 0; i < total; i++) {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const v = p.values?.[i];
    positions.push({
      x: ox + col * spacing,
      y: oy + row * spacing,
      alpha: v == null ? pickLevel() : lo + clamp(v, 0, 1) * (hi - lo),
      diam,
    });
  }

  const layout = {
    overlay: "heatmap",
    ox,
    oy,
    cols,
    rows,
    spacing,
    diam,
    gridW,
    gridH,
    levels,
    rowLabels: p.rowLabels,
    colLabels: p.colLabels ?? chartPresets.months,
    legend: p.legend,
    // Column-major order + a longer stagger gives the left→right sweep.
    stagger: p.stagger,
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Dot plot (before/after per category, joined by faint connectors) ────────
//   categories — [{ label, before, after }] in data units
//   xMin/xMax  — data range across `chartW`
//   chartW, rowHeight — natural px sizes (default 320 / 28)
//   diam, connectorDiam, connectorGap
//   xTicks | xStep, xLabel, legend: [beforeLabel, afterLabel]
export function dotPlotLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.dotPlot, opts);
  const categories = p.categories;
  const xMin = p.xMin;
  const xMax = p.xMax;
  const pad = p.padding;

  const naturalW = p.chartW;
  const naturalH = (categories.length - 1) * p.rowHeight;
  const s = fitScale(naturalW, naturalH, w, h, pad, p);
  const chartW = naturalW * s;
  const chartH = naturalH * s;
  const rowHeight = p.rowHeight * s;
  const diam = p.diam * s;
  const connectorDiam = p.connectorDiam * s;
  const connectorSpacing = connectorDiam + p.connectorGap * s;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - chartW / 2;
  const oy = cy - chartH / 2;
  const toX = (v) => ox + ((v - xMin) / (xMax - xMin)) * chartW;

  const positions = [];
  categories.forEach((cat, ci) => {
    const y = oy + ci * rowHeight;
    const ax = toX(cat.after);
    const bx = toX(cat.before);
    positions.push({ x: ax, y, alpha: 255, diam });
    const gap = bx - ax;
    const dir = Math.sign(gap) || 1;
    const nFill = Math.max(0, Math.floor(Math.abs(gap) / connectorSpacing) - 1);
    for (let fi = 1; fi <= nFill; fi++) {
      positions.push({
        x: ax + dir * fi * connectorSpacing,
        y,
        alpha: 60,
        diam: connectorDiam,
      });
    }
    positions.push({ x: bx, y, alpha: 100, diam });
  });

  const layout = {
    overlay: "dotPlot",
    ox,
    oy,
    chartW,
    chartH,
    rowHeight,
    diam,
    categories,
    xMin,
    xMax,
    xTicks: p.xTicks ?? ticks(xMin, xMax, p.xStep),
    xLabel: p.xLabel,
    legend: p.legend,
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Scatter plot (x/y axes with ticks) ──────────────────────────────────────
// Uses `count` (engine-thinned) points unless `points` is given.
//   points      — [{ x, y, alpha?, diam?, color? }] in data units
//   xMin/xMax, yMin/yMax — data range
//   xTicks, yTicks, xLabel, yLabel
//   formatX/formatY — tick formatters (v) => string
//   maxChartW/maxChartH, minChartW/minChartH — plot area bounds in px
//   diam — dot diameter (default 9)
function defaultFormatX(v) {
  return v >= 1000 ? Math.round(v / 1000) + "K" : String(v);
}

function defaultFormatY(v) {
  if (v === 0) return "0";
  if (v === 1) return "1";
  const ys = v.toFixed(1);
  return ys.charAt(0) === "0" ? ys.slice(1) : ys;
}

export function scatterPlotLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.scatterPlot, opts);
  const random = p.rand ?? Math.random;
  const xMin = p.xMin;
  const xMax = p.xMax;
  const yMin = p.yMin;
  const yMax = p.yMax;
  const pad = p.padding;
  const scale = p.scale ?? 1;

  const availW = w - pad.l - pad.r;
  const availH = h - pad.t - pad.b;
  const chartW = Math.max(p.minChartW, Math.min(p.maxChartW, availW)) * scale;
  const chartH = Math.max(p.minChartH, Math.min(p.maxChartH, availH)) * scale;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - chartW / 2;
  const oy = cy - chartH / 2;
  const diam = p.diam * scale;

  let points = p.points;
  if (!points) {
    // Synthetic upward trend with gaussian noise (the sketch's demo data):
    // x spans ~2%..91% of the range, y rises 0.14 → 0.86 of the range.
    points = [];
    const xr = xMax - xMin;
    const yr = yMax - yMin;
    for (let i = 0; i < count; i++) {
      const x = xMin + xr * (0.0185 + random() * 0.8889);
      const t = (x - xMin) / xr;
      const y = clamp(
        yMin + (0.14 + t * 0.72) * yr + gaussian(random, 0, 0.11 * yr),
        yMin + 0.03 * yr,
        yMax - 0.01 * yr,
      );
      points.push({ x, y });
    }
  }

  const positions = points.map((pt) => ({
    x: ox + ((pt.x - xMin) / (xMax - xMin)) * chartW,
    y: oy + (1 - (pt.y - yMin) / (yMax - yMin)) * chartH,
    alpha: pt.alpha ?? 255,
    diam: pt.diam ?? diam,
    color: pt.color,
  }));

  const layout = {
    overlay: "scatterPlot",
    ox,
    oy,
    chartW,
    chartH,
    xMin,
    xMax,
    yMin,
    yMax,
    xTicks: p.xTicks,
    yTicks: p.yTicks,
    xLabel: p.xLabel,
    yLabel: p.yLabel,
    yLabelPad: p.yLabelPad,
    subtitle: p.subtitle,
    formatX: p.formatX ?? defaultFormatX,
    formatY: p.formatY ?? defaultFormatY,
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Beeswarm (grouped distributions, collision-packed) ──────────────────────
//   groups — [{ label, count, mean, sd, values? }]; `values` (data units)
//            bypasses the gaussian sampling
//   yMin/yMax, yTicks | yStep
//   diam — dot diameter (default 8)
export function beeswarmLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.beeswarm, opts);
  const random = p.rand ?? Math.random;
  const groups = p.groups;
  const yMin = p.yMin;
  const yMax = p.yMax;
  const yRange = yMax - yMin;
  const pad = p.padding;
  const scale = p.scale ?? 1;

  const availW = w - pad.l - pad.r;
  const availH = h - pad.t - pad.b;
  const chartW = Math.max(p.minChartW, Math.min(p.maxChartW, availW)) * scale;
  const chartH = Math.max(p.minChartH, Math.min(p.maxChartH, availH)) * scale;
  const { cx, cy } = centre(w, h, pad, p);
  const ox = cx - chartW / 2;
  const oy = cy - chartH / 2;
  const toY = (yv) => oy + (1 - (yv - yMin) / yRange) * chartH;

  const diam = p.diam * scale;
  const minDistSq = (diam + 1.6 * scale) ** 2;
  const step = diam * 0.58;
  const n = groups.length;
  const maxHorz = Math.max(step * 10, chartW / (n * 1.75) - diam * 0.35);
  const colCenters = groups.map((_, gi) => ox + chartW * ((gi + 0.5) / n));

  // Candidate x offsets: centre first, then alternating outward.
  const tries = [0];
  for (let ring = 1; ring <= 48; ring++) tries.push(ring * step, -ring * step);

  const positions = [];
  groups.forEach((g, gi) => {
    const gx = colCenters[gi];
    const values = g.values
      ? g.values.slice()
      : Array.from({ length: g.count ?? 56 }, () =>
          gaussian(random, g.mean ?? 0, g.sd ?? 1),
        );
    const bucket = values
      .map((v) => clamp(v, yMin, yMax))
      .sort((a, b) => b - a);

    const placed = [];
    for (const yv of bucket) {
      const py = toY(yv);
      let done = false;
      for (const dx of tries) {
        const tx = clamp(gx + dx, gx - maxHorz, gx + maxHorz);
        let clash = false;
        for (const q of placed) {
          const ddx = tx - q.x;
          const ddy = py - q.y;
          if (ddx * ddx + ddy * ddy < minDistSq) {
            clash = true;
            break;
          }
        }
        if (!clash) {
          placed.push({ x: tx, y: py });
          positions.push({ x: tx, y: py, alpha: 255, diam });
          done = true;
          break;
        }
      }
      if (!done) {
        placed.push({ x: gx, y: py });
        positions.push({ x: gx, y: py, alpha: 255, diam });
      }
    }
  });

  const layout = {
    overlay: "beeswarm",
    ox,
    oy,
    chartW,
    chartH,
    yMin,
    yMax,
    yTicks: p.yTicks ?? ticks(yMin, yMax, p.yStep),
    colCenters,
    groupLabels: groups.map((g) => g.label ?? ""),
    ...textOpts(p),
  };
  return { positions, layout };
}

// ─── Timeline (milestone dots on a dotted rule) ──────────────────────────────
//   milestones — [{ t: 0..1, label }]
//   maxWidth   — rule length cap in px (default 560); margin — side inset (48)
//   smallDiam, bigDiam, gap, dimAlpha
export function timelineLayout(count, w, h, opts = {}) {
  const p = withPreset(chartPresets.timeline, opts);
  const milestones = p.milestones;
  const scale = p.scale ?? 1;
  const margin = p.margin;
  const lineW = Math.max(1, Math.min(p.maxWidth, w - margin * 2)) * scale;
  const cx = p.cx ?? w / 2;
  const cy = p.cy ?? h / 2;
  const xStart = cx - lineW / 2;
  const smallDiam = p.smallDiam * scale;
  const bigDiam = p.bigDiam * scale;
  const dimAlpha = p.dimAlpha;
  const sp = smallDiam + p.gap * scale;
  const rb = bigDiam / 2;
  const rs = smallDiam / 2;
  const edgeFromBig = rb + 3.5 * scale + rs;

  const mx = milestones.map((m) => xStart + m.t * lineW);

  const positions = [];
  const fillSegment = (left, right) => {
    if (right - left < rs) return;
    const n = Math.max(1, Math.round((right - left) / sp) + 1);
    for (let k = 0; k < n; k++) {
      const x =
        n === 1 ? (left + right) / 2 : left + (right - left) * (k / (n - 1));
      positions.push({ x, y: cy, alpha: dimAlpha, diam: smallDiam });
    }
  };

  fillSegment(xStart + rs + 2, mx[0] - edgeFromBig);
  for (let i = 0; i < milestones.length - 1; i++)
    fillSegment(mx[i] + edgeFromBig, mx[i + 1] - edgeFromBig);
  fillSegment(mx[milestones.length - 1] + edgeFromBig, xStart + lineW - rs - 2);
  for (let i = 0; i < milestones.length; i++)
    positions.push({ x: mx[i], y: cy, alpha: 255, diam: bigDiam });

  // Left→right order so a staggered transition draws the rule across.
  positions.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.diam - b.diam));

  const layout = {
    overlay: "timeline",
    xStart,
    lineW,
    cy,
    milestones: milestones.map((m, i) => ({
      x: mx[i],
      y: cy + rb + 12,
      label: m.label,
    })),
    ...textOpts(p),
  };
  return { positions, layout };
}

export const chartLayouts = {
  barChart: barChartLayout,
  simpleBars: simpleBarsLayout,
  heatmap: heatmapLayout,
  dotPlot: dotPlotLayout,
  scatterPlot: scatterPlotLayout,
  beeswarm: beeswarmLayout,
  timeline: timelineLayout,
};
