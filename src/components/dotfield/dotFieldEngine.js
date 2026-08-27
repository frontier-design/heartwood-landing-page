import { layouts } from './layouts/index.js'

// ─── DotFieldEngine ──────────────────────────────────────────────────────────
// p5-driven particle system, decoupled from React and the p5 lifecycle.
// It owns the dots and their behaviour; the DotField component drives it by
// calling init / resize / setLayout / update inside a p5 sketch.
//
// Each dot moves through modes:
//   wander — drifts with noise-steered velocity (idle state)
//   seek   — eases toward a target position, then becomes `seekAfter`
//   parked — holds its target position (still responds to the cursor)
//   dead   — faded out, pending trim
//
// setLayout(name, opts) builds target positions from a layout generator and
// transitions every dot toward them — the reusable interaction between stages.

const WANDER_MAX_STEER = 0.011
const WANDER_NOISE_TIME_SCALE = 0.0032
const WANDER_SPEED_MIN = 0.01
const WANDER_SPEED_MAX = 0.15
const SEEK_DURATION_MS = 900
// Total spread of per-dot start delays across a transition. Each dot begins its
// ease at (i / (n - 1)) * MAX_STAGGER_MS, so the field flows between states
// rather than snapping all at once (mirrors playback-engine.js).
const MAX_STAGGER_MS = 300
// Continuous scrub: 0-duration holds so the whole scroll range morphs between
// states with no still stretches. getSegmentAndPhase skips 0-duration phases.
const HOLD_MS = 0
const CURSOR_INFLUENCE_RADIUS = 110
const CURSOR_MAX_PUSH = 16
const CURSOR_NUDGE_EASE = 0.18

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Per-dot start delay so a transition flows across the field rather than moving
// every dot at once (mirrors playback-engine.js).
function getStaggerDelay(i, n) {
  return n <= 1 ? 0 : (i / (n - 1)) * MAX_STAGGER_MS
}

function getTransitionMs() {
  return MAX_STAGGER_MS + SEEK_DURATION_MS
}

// Mulberry32 seeded PRNG → deterministic [0,1). Re-seeding before each layout
// build means a resize reproduces the same arrangement (scaled), instead of
// re-rolling Math.random() and reshuffling every dot.
function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export class DotFieldEngine {
  constructor(config = {}) {
    this.count = config.count ?? 100
    this.dotDiameter = config.dotDiameter ?? 8
    this.dotR = this.dotDiameter / 2
    this.wanderEnabled = config.wander ?? true
    this.cursorEnabled = config.cursor ?? true
    this.driftAmp = config.drift ?? 2
    // Fixed per-instance seed so layouts stay put across resizes.
    this.seed = (config.seed ?? Math.floor(Math.random() * 0xffffffff)) >>> 0 || 1
    this.dots = []
    this.w = 0
    this.h = 0
    this._p = null
    this._targetCount = this.count
    this._current = config.layout
      ? { name: config.layout, opts: config.layoutOptions ?? {} }
      : null
    this._pending = this._current
    // Ordered "keyframe" states for the scrub timeline. Each is a layout that
    // the scroll position interpolates between via seek(). Falls back to the
    // single configured layout so the trigger-based path keeps working.
    this.states = Array.isArray(config.states) && config.states.length
      ? config.states.map((s) => ({ name: s.name ?? s.layout, opts: s.opts ?? {} }))
      : this._current
        ? [this._current]
        : []
    this._posCache = []
    this._scrubActive = false
    this._scrubProgress = 0
  }

  // Distinct RNG stream per state so two same-named layouts don't produce an
  // identical arrangement.
  _seedForState(i) {
    return ((this.seed ^ (i * 0x9e3779b9)) >>> 0) || 1
  }

  _makeDot(p, x, y, alpha, diam) {
    return {
      x,
      y,
      color: null,
      angle: p.random(p.TWO_PI),
      noiseKey: p.random(2000),
      wanderSpeed: p.random(WANDER_SPEED_MIN, WANDER_SPEED_MAX),
      nudgeX: 0,
      nudgeY: 0,
      driftPhase: p.random(p.TWO_PI),
      driftX: 0,
      driftY: 0,
      mode: 'wander',
      seekSX: 0, seekSY: 0, seekEX: 0, seekEY: 0,
      seekT0: 0, seekDur: SEEK_DURATION_MS, seekAfter: 'parked',
      alpha, alphaFrom: alpha, alphaTo: alpha, alphaT0: 0, alphaDur: 0,
      diam, diamFrom: diam, diamTo: diam, diamT0: 0, diamDur: 0,
    }
  }

  init(p, w, h) {
    this._p = p
    this.w = w
    this.h = h
    this.dots = []
    for (let i = 0; i < this.count; i++) {
      this.dots.push(
        this._makeDot(
          p,
          p.random(this.dotR, Math.max(this.dotR, w - this.dotR)),
          p.random(this.dotR, Math.max(this.dotR, h - this.dotR)),
          255,
          this.dotDiameter,
        ),
      )
    }
    if (this._pending) {
      const { name, opts } = this._pending
      this._pending = null
      this.setLayout(p, name, opts)
    }
  }

  resize(p, w, h) {
    this._p = p
    this.w = w
    this.h = h
    for (const d of this.dots) {
      d.x = p.constrain(d.x, this.dotR, Math.max(this.dotR, w - this.dotR))
      d.y = p.constrain(d.y, this.dotR, Math.max(this.dotR, h - this.dotR))
    }
    this._posCache = []
    // Re-resolve for the new dimensions: re-scrub at the same progress when the
    // field is scroll-driven, otherwise snap the active layout (no animation).
    if (this._scrubActive) this.seek(this._scrubProgress)
    else if (this._current) this.setLayout(p, this._current.name, this._current.opts, { instant: true })
  }

  // Declare the ordered states the scrub timeline interpolates between. Does not
  // animate — seek() drives the field afterwards.
  setStates(states) {
    this.states = (states ?? []).map((s) => ({ name: s.name ?? s.layout, opts: s.opts ?? {} }))
    this._posCache = []
  }

  // Build (and cache) the pixel positions for a state at the current size. The
  // per-state seed keeps arrangements deterministic across resizes.
  _positionsFor(index) {
    if (this._posCache[index]) return this._posCache[index]
    const state = this.states[index]
    if (!state) return []
    const build = layouts[state.name]
    if (!build) return []
    const total = Math.max(0, Math.round(state.opts.count ?? this.count))
    const rand = mulberry32(this._seedForState(index))
    const positions = build(total, this.w, this.h, { ...state.opts, rand })
    this._posCache[index] = positions
    return positions
  }

  _buildTimeline() {
    const phases = []
    for (let i = 0; i < this.states.length; i++) {
      phases.push({ type: 'hold', kfIndex: i, duration: HOLD_MS })
      if (i < this.states.length - 1) {
        phases.push({ type: 'transition', fromIndex: i, toIndex: i + 1, duration: getTransitionMs() })
      }
    }
    return phases
  }

  getSegmentAndPhase(progress) {
    const n = this.states.length
    if (n <= 1) return { segment: 0, phase: 'hold', phaseT: 0, fromIndex: 0, toIndex: 0 }
    const phases = this._buildTimeline()
    let total = 0
    for (const p of phases) total += p.duration
    if (total <= 0) return { segment: 0, phase: 'hold', phaseT: 0, fromIndex: 0, toIndex: 0 }

    const elapsed = progress * total
    let accumulated = 0
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i]
      if (accumulated + p.duration > elapsed) {
        const phaseT = (elapsed - accumulated) / p.duration
        if (p.type === 'hold') return { segment: i, phase: 'hold', phaseT, fromIndex: p.kfIndex, toIndex: p.kfIndex }
        return { segment: i, phase: 'transition', phaseT, fromIndex: p.fromIndex, toIndex: p.toIndex }
      }
      accumulated += p.duration
    }
    const last = phases[phases.length - 1]
    if (last.type === 'hold') return { segment: phases.length - 1, phase: 'hold', phaseT: 1, fromIndex: last.kfIndex, toIndex: last.kfIndex }
    return { segment: phases.length - 1, phase: 'transition', phaseT: 1, fromIndex: last.fromIndex, toIndex: last.toIndex }
  }

  // Scrub driver: deterministically position every dot for a 0..1 progress,
  // reversibly (mirrors playback-engine.js seekTo / snapToInterpolated).
  seek(progress) {
    this._scrubProgress = Math.max(0, Math.min(1, progress))
    this._scrubActive = true
    if (this.w === 0 || this.h === 0) return
    if (this.states.length <= 1) {
      this._snapToState(0)
      return
    }
    const { phase, phaseT, fromIndex, toIndex } = this.getSegmentAndPhase(this._scrubProgress)
    if (phase === 'hold') this._snapToState(fromIndex)
    else this._snapToInterpolated(fromIndex, toIndex, phaseT)
  }

  _snapToState(index) {
    const positions = this._positionsFor(index)
    this._ensureCount(this._p, positions.length)
    this._targetCount = positions.length
    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i]
      if (i >= positions.length) {
        d.mode = 'dead'; d.alpha = 0; d.diam = 0; d.alphaDur = 0; d.diamDur = 0
        continue
      }
      const pos = positions[i]
      d.x = pos.x; d.y = pos.y
      d.color = pos.color ?? null
      d.mode = 'parked'
      d.alpha = pos.alpha ?? 255
      d.diam = pos.diam ?? this.dotDiameter
      d.alphaDur = 0; d.diamDur = 0
    }
  }

  _snapToInterpolated(fromIndex, toIndex, t) {
    const posA = this._positionsFor(fromIndex)
    const posB = this._positionsFor(toIndex)
    const minDots = Math.min(posA.length, posB.length)
    const maxDots = Math.max(posA.length, posB.length)
    const virtualElapsed = t * getTransitionMs()

    const dotProgress = (idx) => {
      const e = virtualElapsed - getStaggerDelay(idx, maxDots)
      if (e <= 0) return 0
      if (e >= SEEK_DURATION_MS) return 1
      return easeInOutCubic(e / SEEK_DURATION_MS)
    }

    this._ensureCount(this._p, maxDots)
    this._targetCount = maxDots

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i]
      if (i >= maxDots) {
        d.mode = 'dead'; d.alpha = 0; d.diam = 0; d.alphaDur = 0; d.diamDur = 0
        continue
      }
      d.mode = 'parked'; d.alphaDur = 0; d.diamDur = 0
      d.color = posB[i]?.color ?? posA[i]?.color ?? null
      const e = dotProgress(i)
      if (i < minDots) {
        d.x = posA[i].x + (posB[i].x - posA[i].x) * e
        d.y = posA[i].y + (posB[i].y - posA[i].y) * e
        const aA = posA[i].alpha ?? 255, aB = posB[i].alpha ?? 255
        d.alpha = aA + (aB - aA) * e
        const dA = posA[i].diam ?? this.dotDiameter, dB = posB[i].diam ?? this.dotDiameter
        d.diam = dA + (dB - dA) * e
      } else if (posA.length > posB.length) {
        d.x = posA[i].x; d.y = posA[i].y
        d.alpha = (posA[i].alpha ?? 255) * (1 - e)
        d.diam = (posA[i].diam ?? this.dotDiameter) * (1 - e)
      } else {
        d.x = posB[i].x; d.y = posB[i].y
        d.alpha = (posB[i].alpha ?? 255) * e
        d.diam = (posB[i].diam ?? this.dotDiameter) * e
      }
    }
  }

  setLayout(p, name, opts = {}, control = {}) {
    this._scrubActive = false
    this._current = { name, opts }
    if (!p || this.w === 0 || this.h === 0) {
      this._pending = { name, opts }
      return
    }
    const build = layouts[name]
    if (!build) return
    // opts.count lets a stage use fewer/more dots than the base count.
    const total = Math.max(0, Math.round(opts.count ?? this.count))
    const rand = mulberry32(this.seed)
    const positions = build(total, this.w, this.h, { ...opts, rand })
    this._transitionTo(p, positions, { ...opts, ...control })
  }

  _ensureCount(p, n) {
    while (this.dots.length < n) {
      this.dots.push(
        this._makeDot(
          p,
          p.random(this.dotR, Math.max(this.dotR, this.w - this.dotR)),
          p.random(this.dotR, Math.max(this.dotR, this.h - this.dotR)),
          0,
          0,
        ),
      )
    }
  }

  _transitionTo(p, positions, opts = {}) {
    const instant = opts.instant ?? false
    const dur = instant ? 1 : Math.max(1, opts.duration ?? SEEK_DURATION_MS)
    // Spread per-dot start delays across the whole field so it flows between
    // states rather than snapping. Normalised by index so the total spread is
    // constant regardless of dot count (mirrors playback-engine.js).
    const maxStagger = instant ? 0 : opts.stagger ?? MAX_STAGGER_MS
    const seekAfter = opts.seekAfter ?? 'parked'
    // Per-state dot size: opts.diam overrides the base diameter for this stage.
    const stateDiam = opts.diam ?? this.dotDiameter
    const now = p.millis()
    const used = positions.length
    this._ensureCount(p, used)
    this._targetCount = used

    const denom = used > 1 ? used - 1 : 1

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i]

      // Surplus dots fade out and die.
      if (i >= used) {
        d.mode = 'seek'
        d.seekSX = d.x; d.seekSY = d.y; d.seekEX = d.x; d.seekEY = d.y
        d.seekT0 = now; d.seekDur = 1; d.seekAfter = 'dead'
        d.alphaFrom = d.alpha; d.alphaTo = 0; d.alphaT0 = now; d.alphaDur = instant ? 1 : 500
        d.diamFrom = d.diam; d.diamTo = 0; d.diamT0 = now; d.diamDur = instant ? 1 : 500
        continue
      }

      const pos = positions[i]
      const delay = (i / denom) * maxStagger

      d.color = pos.color ?? null
      d.mode = 'seek'
      d.seekSX = d.x; d.seekSY = d.y
      d.seekEX = pos.x; d.seekEY = pos.y
      d.seekT0 = now + delay; d.seekDur = dur; d.seekAfter = seekAfter

      d.diamFrom = d.diam; d.diamTo = pos.diam ?? stateDiam
      d.diamT0 = now + delay; d.diamDur = dur

      d.alphaFrom = d.alpha; d.alphaTo = pos.alpha ?? 255
      d.alphaT0 = now + delay; d.alphaDur = dur
    }
  }

  _applyCursor(p) {
    const mx = p.mouseX
    const my = p.mouseY
    const rad = CURSOR_INFLUENCE_RADIUS
    const ease = CURSOR_NUDGE_EASE
    for (const d of this.dots) {
      const nvx = d.x - mx
      const nvy = d.y - my
      const distSq = nvx * nvx + nvy * nvy
      let tx = 0
      let ty = 0
      if (distSq < rad * rad && distSq > 1e-6) {
        const dist = Math.sqrt(distSq)
        const str = CURSOR_MAX_PUSH * (1 - dist / rad) * (1 - dist / rad)
        tx = (nvx / dist) * str
        ty = (nvy / dist) * str
      }
      d.nudgeX += (tx - d.nudgeX) * ease
      d.nudgeY += (ty - d.nudgeY) * ease
    }
  }

  update(p) {
    this._p = p
    const now = p.millis()
    const t = p.frameCount * WANDER_NOISE_TIME_SCALE

    // While scroll-scrubbing, seek() has already written every dot's final
    // position and zeroed its tween timers, so skip the wander/seek/drift and
    // trim passes. The cursor nudge (below) stays live — it's additive.
    if (this._scrubActive) {
      if (this.cursorEnabled) this._applyCursor(p)
      return
    }

    for (const d of this.dots) {
      if (d.mode === 'wander') {
        if (!this.wanderEnabled) continue
        const steer = p.map(p.noise(d.noiseKey, t), 0, 1, -1, 1) * WANDER_MAX_STEER
        d.angle += steer
        let vx = p.cos(d.angle) * d.wanderSpeed
        let vy = p.sin(d.angle) * d.wanderSpeed
        d.x += vx
        d.y += vy
        if (d.x < this.dotR) { d.x = this.dotR; vx *= -1 }
        else if (d.x > this.w - this.dotR) { d.x = this.w - this.dotR; vx *= -1 }
        if (d.y < this.dotR) { d.y = this.dotR; vy *= -1 }
        else if (d.y > this.h - this.dotR) { d.y = this.h - this.dotR; vy *= -1 }
        d.angle = p.atan2(vy, vx)
      } else if (d.mode === 'seek') {
        const elapsed = now - d.seekT0
        if (elapsed >= d.seekDur) {
          d.x = d.seekEX
          d.y = d.seekEY
          d.mode = d.seekAfter || 'parked'
        } else if (elapsed > 0) {
          const u = easeInOutCubic(elapsed / d.seekDur)
          d.x = d.seekSX + (d.seekEX - d.seekSX) * u
          d.y = d.seekSY + (d.seekEY - d.seekSY) * u
        }
      }

      // Parked dots breathe with a small per-dot drift so the field stays alive.
      if (this.driftAmp > 0 && d.mode === 'parked') {
        d.driftPhase += 0.01
        d.driftX = Math.cos(d.driftPhase) * this.driftAmp
        d.driftY = Math.sin(d.driftPhase * 1.3) * this.driftAmp
      }
    }

    if (this.cursorEnabled) this._applyCursor(p)

    for (const d of this.dots) {
      if (d.alphaDur > 0) {
        const ae = now - d.alphaT0
        if (ae >= d.alphaDur) { d.alpha = d.alphaTo; d.alphaDur = 0 }
        else if (ae > 0) { d.alpha = d.alphaFrom + (d.alphaTo - d.alphaFrom) * easeInOutCubic(ae / d.alphaDur) }
      }
      if (d.diamDur > 0) {
        const de = now - d.diamT0
        if (de >= d.diamDur) { d.diam = d.diamTo; d.diamDur = 0 }
        else if (de > 0) { d.diam = d.diamFrom + (d.diamTo - d.diamFrom) * easeInOutCubic(de / d.diamDur) }
      }
    }

    // Trim faded-out surplus dots back down to the active target count. We keep
    // at least the base count so a smaller stage can grow again without a remount.
    const keep = Math.max(this.count, this._targetCount)
    if (this.dots.length > keep) {
      let canTrim = true
      for (let r = keep; r < this.dots.length; r++) {
        const dd = this.dots[r]
        if (dd.mode !== 'dead' || dd.alphaDur > 0 || dd.diamDur > 0) { canTrim = false; break }
      }
      if (canTrim) this.dots.length = keep
    }
  }
}

export default DotFieldEngine
