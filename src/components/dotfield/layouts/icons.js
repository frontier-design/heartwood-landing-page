import iconPresetsJson from "./icon-presets.json" with { type: "json" };

export const ICON_GRID_SIZE = iconPresetsJson.gridSize;
export const iconPresets = iconPresetsJson.icons;

function normaliseCell(c) {
  if (Array.isArray(c)) return { col: c[0], row: c[1] };
  return c;
}

export function resolveIconCells(opts = {}) {
  if (Array.isArray(opts.cells)) return opts.cells.map(normaliseCell);
  const preset = opts.icon ? iconPresets[opts.icon] : null;
  return preset ? preset.cells.map(normaliseCell) : [];
}

export function iconGeometry(w, h, opts = {}) {
  const gridSize = opts.gridSize ?? ICON_GRID_SIZE;
  const axis = Math.min(w, h);
  const sizeOpt = opts.size ?? 1;
  const size = sizeOpt <= 1 ? axis * sizeOpt : sizeOpt;
  const cell = size / gridSize;
  const cx = opts.cx ?? w / 2;
  const cy = opts.cy ?? h / 2;
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  const diam = opts.diam ?? cell * 0.7;

  const cells = resolveIconCells(opts);
  let minCol = Infinity;
  let maxCol = -Infinity;
  let minRow = Infinity;
  let maxRow = -Infinity;
  for (const c of cells) {
    if (c.col < minCol) minCol = c.col;
    if (c.col > maxCol) maxCol = c.col;
    if (c.row < minRow) minRow = c.row;
    if (c.row > maxRow) maxRow = c.row;
  }
  const bounds = cells.length
    ? {
        x: ox + minCol * cell,
        y: oy + minRow * cell,
        w: (maxCol - minCol + 1) * cell,
        h: (maxRow - minRow + 1) * cell,
      }
    : { x: cx, y: cy, w: 0, h: 0 };

  return { gridSize, axis, size, cell, cx, cy, ox, oy, diam, bounds };
}

function orderCells(cells, order, g, random) {
  if (!order || order === "preset" || cells.length <= 1) return cells;
  const out = cells.slice();
  if (order === "scan") {
    out.sort((a, b) => a.row - b.row || a.col - b.col);
  } else if (order === "radial") {
    const icx = g.bounds.x + g.bounds.w / 2;
    const icy = g.bounds.y + g.bounds.h / 2;
    const angleOf = (c) =>
      Math.atan2(
        g.oy + (c.row + 0.5) * g.cell - icy,
        g.ox + (c.col + 0.5) * g.cell - icx,
      );
    out.sort((a, b) => angleOf(a) - angleOf(b));
  } else if (order === "random") {
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
  }
  return out;
}

// `count` is intentionally ignored: an icon has exactly as many dots as lit
// cells, and thinning it for density would break the glyph.
export function iconLayout(count, w, h, opts = {}) {
  const random = opts.rand ?? Math.random;
  const g = iconGeometry(w, h, opts);
  const cells = orderCells(resolveIconCells(opts), opts.order, g, random);
  const alpha = opts.alpha ?? 255;

  return cells.map((c) => ({
    x: g.ox + (c.col + 0.5) * g.cell,
    y: g.oy + (c.row + 0.5) * g.cell,
    diam: c.diam ?? g.diam,
    alpha: c.alpha ?? alpha,
    color: c.color,
  }));
}
