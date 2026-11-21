#!/usr/bin/env node
// Synthesises the transition sounds and the beds (Émile's docs/TECH.md
// §12.1 乐器与音效), made the way a sound designer layers them, so the
// moment each meets the cut is known exactly (its `cut`, seconds in):
//
//   riser     1–4 s into the cut: a Shepard tone climbing, noise tightening,
//             a pulse speeding up, a reversed cymbal; loudest at its end
//   swell     a reversed reverb (a cymbal, a boom, a chord) drawn into the cut
//   boom      a cinematic hit (tag impact): a click, a falling low thump, a
//             thud, a metal ring, a hall tail; the cut is its attack
//   sub-drop  a clean low sine falling away from the cut, under a hit
//   sweep     a pass-by: rises, moves left to right, drops in pitch as it
//             goes, trails off in a room; the cut at its peak
//   bed       an ambience (tag ambience): a room, a city at night, wind,
//             rain, a building's air; starts where it is laid (cut 0)
//
// Levels are set by loudness, not peak: at gain 1 a transition sits just
// under music at -16 LUFS (its loudest 400 ms at about -20), a boom with
// it (-16), a bed well under it (-30); peaks never above -1 dBFS. The same
// code makes the same file every time (seeded noise), 48 kHz 16-bit stereo.
//
//   node scripts/transitions.mjs                  (every one, as packs: emile/<kind>-<nn>/)
//   node scripts/transitions.mjs --out <folder>   (every one as a WAV, to listen)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SR = 48000
const ROOT = path.resolve(import.meta.dirname, '..')
const n = s => Math.round(s * SR)
const TAU = 2 * Math.PI

// ---- signals ------------------------------------------------------------------

function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0
    return s / 4294967296 * 2 - 1
  }
}
const white = (len, seed) => { const r = rng(seed), x = new Float64Array(len); for (let i = 0; i < len; i++) x[i] = r(); return x }
// Pink (Kellet's filter) and brown (leaky integral) noise, about unit level
function pink(len, seed) {
  const w = white(len, seed), y = new Float64Array(len)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < len; i++) {
    const v = w[i]
    b0 = 0.99886 * b0 + v * 0.0555179; b1 = 0.99332 * b1 + v * 0.0750759; b2 = 0.969 * b2 + v * 0.153852
    b3 = 0.8665 * b3 + v * 0.3104856; b4 = 0.55 * b4 + v * 0.5329522; b5 = -0.7616 * b5 - v * 0.016898
    y[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + v * 0.5362) * 0.11; b6 = v * 0.115926
  }
  return y
}
function brown(len, seed) {
  const w = white(len, seed), y = new Float64Array(len)
  let v = 0
  for (let i = 0; i < len; i++) { v = (v + 0.02 * w[i]) * 0.998; y[i] = v * 3.5 }
  return y
}
// A biquad (RBJ) whose frequency may follow f(i)
function biquad(x, kind, f, q = 0.707) {
  const y = new Float64Array(x.length), fn = typeof f === 'function' ? f : () => f
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < x.length; i++) {
    const w = TAU * Math.min(Math.max(fn(i), 10), SR * 0.45) / SR, c = Math.cos(w), a = Math.sin(w) / (2 * q)
    let b0, b1, b2
    if (kind === 'band') { b0 = a; b1 = 0; b2 = -a } else if (kind === 'high') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2 } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2 }
    const a0 = 1 + a
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 + 2 * c * y1 - (1 - a) * y2) / a0
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v
  }
  return y
}
// An oscillator whose frequency follows f(i)
function osc(len, f, shape = 'sine', phase = 0) {
  const y = new Float64Array(len), fn = typeof f === 'function' ? f : () => f
  let p = phase
  for (let i = 0; i < len; i++) {
    p += fn(i) / SR; p -= Math.floor(p)
    y[i] = shape === 'saw' ? 2 * p - 1 : Math.sin(TAU * p)
  }
  return y
}
const glide = (a, b, t) => a * Math.pow(b / a, Math.min(1, Math.max(0, t)))
const env = (x, f) => x.map((v, i) => v * f(i / x.length, i))
const scale = (x, g) => x.map(v => v * g)
const sum = (...xs) => { const y = new Float64Array(Math.max(...xs.map(x => x.length))); for (const x of xs) for (let i = 0; i < x.length; i++) y[i] += x[i]; return y }
const fit = (x, len) => { const y = new Float64Array(len); y.set(x.subarray(0, Math.min(len, x.length))); return y }
const rms = x => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / Math.max(1, x.length)) || 1e-9
const unit = x => scale(x, 1 / rms(x))
const sat = (x, drive) => x.map(v => Math.tanh(v * drive) / Math.tanh(drive))
const reverse = x => x.slice().reverse()
// Stereo: [left, right]
const both = x => [x, x.slice()]
const smix = (...ss) => [sum(...ss.map(s => s[0])), sum(...ss.map(s => s[1]))]
const sscale = ([l, r], g) => [scale(l, g), scale(r, g)]
const sfit = ([l, r], len) => [fit(l, len), fit(r, len)]
// Equal-power pan following p(i) in -1 (left) … 1 (right)
function pan(x, p) {
  const l = new Float64Array(x.length), r = new Float64Array(x.length), fn = typeof p === 'function' ? p : () => p
  for (let i = 0; i < x.length; i++) { const a = (fn(i) + 1) * Math.PI / 4; l[i] = x[i] * Math.cos(a); r[i] = x[i] * Math.sin(a) }
  return [l, r]
}

function fft(re, im, inverse) {
  const N = re.length
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = TAU / len * (inverse ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang), h = len / 2
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0
      for (let k = 0; k < h; k++) {
        const ar = re[i + k + h] * cr - im[i + k + h] * ci, ai = re[i + k + h] * ci + im[i + k + h] * cr
        re[i + k + h] = re[i + k] - ar; im[i + k + h] = im[i + k] - ai
        re[i + k] += ar; im[i + k] += ai
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t
      }
    }
  }
  if (inverse) for (let i = 0; i < N; i++) { re[i] /= N; im[i] /= N }
}
function convolve(x, h) {
  let N = 1
  while (N < x.length + h.length) N <<= 1
  const ar = new Float64Array(N), ai = new Float64Array(N), br = new Float64Array(N), bi = new Float64Array(N)
  ar.set(x); br.set(h)
  fft(ar, ai, false); fft(br, bi, false)
  for (let i = 0; i < N; i++) { const r = ar[i] * br[i] - ai[i] * bi[i]; ai[i] = ar[i] * bi[i] + ai[i] * br[i]; ar[i] = r }
  fft(ar, ai, true)
  return ar.slice(0, x.length + h.length - 1)
}
// A hall's response: a few early reflections, then decaying noise that
// darkens as it goes; each side its own noise, so the tail is wide
function hallIR(rt60, seed, dark = 3500, pre = 0.02) {
  const len = n(rt60 * 1.2), x = new Float64Array(len), w = white(len, seed), r = rng(seed + 99)
  for (let i = n(pre); i < len; i++) x[i] = w[i] * Math.pow(10, -3 * (i / SR) / rt60)
  for (let k = 0; k < 6; k++) x[n(pre * (0.3 + 0.25 * k + 0.1 * Math.abs(r())))] += 0.6 * r()
  const y = biquad(x, 'low', i => glide(dark * 2.5, dark / 4, i / len), 0.6)
  return scale(y, 1 / Math.sqrt(y.reduce((s, v) => s + v * v, 0)))
}
// x (mono or stereo) in a hall: dry plus `wet` of its tail
function room(x, { rt60 = 2.5, wet = 0.3, dark = 3500, seed = 1 } = {}) {
  const [l, r] = Array.isArray(x) ? x : both(x)
  const hl = hallIR(rt60, seed), hr = hallIR(rt60, seed + 50)
  const tl = convolve(l, hl), tr = convolve(r, hr)
  const g = wet * rms(l) / Math.max(1e-9, rms(tl.subarray(0, l.length))) * 0.8
  return [sum(scale(l, 1 - wet * 0.5), scale(tl, g)), sum(scale(r, 1 - wet * 0.5), scale(tr, g))]
}
// A short fade at either end so nothing clicks
function edges([l, r], head = 0.003, tail = 0.003) {
  for (const x of [l, r]) {
    const h = n(head), t = n(tail)
    for (let i = 0; i < h && i < x.length; i++) x[i] *= i / h
    for (let i = 0; i < t && i < x.length; i++) x[x.length - 1 - i] *= i / t
  }
  return [l, r]
}

// ---- the parts sounds are layered from ---------------------------------------------

// A Shepard tone: octave-spaced partials climbing `octaves` over `len`
// samples under a bell over log frequency, so it seems to rise for ever
function shepard(len, { octaves = 1.5, centre = 330, spread = 1.6, voices = 8, low = 27.5, seed = 1 } = {}) {
  const y = new Float64Array(len), r = rng(seed)
  for (let k = 0; k < voices; k++) {
    const phase0 = Math.abs(r())
    let p = phase0
    for (let i = 0; i < len; i++) {
      const pos = (k + octaves * Math.pow(i / len, 1.25)) % voices
      const f = low * Math.pow(2, pos)
      const w = Math.exp(-Math.pow(Math.log2(f / centre), 2) / (2 * spread * spread))
      p += f / SR; p -= Math.floor(p)
      y[i] += w * (Math.sin(TAU * p) + 0.25 * Math.sin(2 * TAU * p))
    }
  }
  return y
}
// A cymbal: a burst of bright noise through metallic resonances
function cymbal(seed, seconds = 1.5) {
  const len = n(seconds), x = env(white(len, seed), t => Math.exp(-t * seconds / 0.5))
  const bands = [3100, 4700, 6300, 8200, 10400].map((f, k) => biquad(x, 'band', f * (1 + 0.03 * k), 6))
  return biquad(sum(scale(x, 0.4), ...bands), 'high', 2500, 0.7)
}
// A cinematic hit at sample 0
function hitParts({ seconds = 3, low = 150, to = 38, body = 0.5, thud = 0.6, metal = 0.25, click = 0.5, seed = 1 }) {
  const len = n(seconds)
  const tick = sum(env(biquad(white(n(0.008), seed), 'high', 2200), t => 1 - t), scale(env(osc(n(0.006), 1400), t => 1 - t), 0.5))
  const fall = i => to + (low - to) * Math.exp(-(i / SR) / 0.07)
  const thump = sat(env(osc(len, fall), (t, i) => Math.min(1, i / n(0.002)) * Math.exp(-(i / SR) / body)), 1.6)
  const thudN = env(biquad(pink(n(0.4), seed + 3), 'low', 260, 0.8), (t, i) => Math.exp(-(i / SR) / 0.09))
  const ring = sum(...[1, 2.76, 5.4, 8.93].map((m, k) => scale(env(osc(len, 92 * m, 'sine', k * 0.2), (t, i) => Math.exp(-(i / SR) / (1.4 / (k + 1)))), 1 / (k + 1))))
  // faded over its last 40 %, so nothing is cut off at its end
  return env(sum(scale(unit(tick), click * 0.6), unit(thump), scale(unit(thudN), thud), scale(unit(ring), metal * 0.5)), t => (t < 0.6 ? 1 : Math.pow(Math.cos((t - 0.6) / 0.4 * Math.PI / 2), 2)))
}

// ---- the kinds ----------------------------------------------------------------------

function riser({ seconds, octaves = 1.5, centre = 330, noise = 0.8, pulse = 0.5, cymbal: cym = 0.6, seed }) {
  const len = n(seconds)
  const tone = biquad(shepard(len, { octaves, centre, seed }), 'low', i => glide(900, 9000, i / len), 0.7)
  const air = (s) => biquad(pink(len, seed + s), 'band', i => glide(350, 7000, Math.pow(i / len, 1.3)), 0.6 + 2.5 * 0)
  // a pulse that speeds up from 3 to 22 a second and deepens
  let ph = 0
  const trem = new Float64Array(len)
  for (let i = 0; i < len; i++) { const t = i / len; ph += glide(3, 22, t) / SR; trem[i] = 1 - pulse * t * (0.5 - 0.5 * Math.cos(TAU * ph)) }
  const swellUp = (t) => Math.pow(t, 2.4) * 0.97 + 0.03 * t
  const toneS = both(env(unit(tone), (t, i) => swellUp(t) * trem[i]))
  const airS = [env(unit(air(1)), (t, i) => swellUp(t) * trem[i]), env(unit(air(2)), (t, i) => swellUp(t) * trem[i])]
  const cymR = reverse(fit(convolve(cymbal(seed + 7), hallIR(2.2, seed + 9, 7000)), len))
  const cymS = [unit(cymR), unit(reverse(fit(convolve(cymbal(seed + 8), hallIR(2.2, seed + 19, 7000)), len)))]
  return edges(smix(toneS, sscale(airS, noise), sscale(cymS, cym)), 0.05, 0.004)
}
function swell({ seconds, source = 'cymbal', rt60 = 3, root = 220, seed }) {
  const len = n(seconds)
  let src
  if (source === 'cymbal') src = cymbal(seed)
  else if (source === 'boom') src = hitParts({ seconds: 0.25, seed, metal: 0.4 })
  else src = sum(...[1, 1.5, 2, 2.5198].map((m, k) => env(osc(n(1.2), root * m, 'sine', 0.1 * k), (t, i) => Math.exp(-(i / SR) / 0.5) * Math.min(1, i / n(0.004)))))
  // its own end faded, so turned round it doesn't start with a jump
  src = env(src, t => (t < 0.7 ? 1 : Math.pow(Math.cos((t - 0.7) / 0.3 * Math.PI / 2), 2)))
  const tl = reverse(fit(convolve(src, hallIR(rt60, seed + 1, source === 'cymbal' ? 6500 : 3000)), len))
  const tr = reverse(fit(convolve(src, hallIR(rt60, seed + 2, source === 'cymbal' ? 6500 : 3000)), len))
  // the tail cut at its length comes first once turned round: brought in
  // from nothing over the first 60 %, so it grows out of silence
  const grow = t => (t < 0.6 ? Math.pow(t / 0.6, 2) : 1)
  return edges([env(tl, grow), env(tr, grow)], 0.08, 0.004)
}
function boom({ seconds = 3, rt60 = 3, wet = 0.35, ...p }) {
  const dry = hitParts({ seconds, ...p })
  const [l, r] = room(dry, { rt60, wet, dark: 2800, seed: (p.seed ?? 1) + 5 })
  return edges(sfit([l, r], n(seconds + rt60 * 0.6)), 0.0005, 0.3)
}
function subDrop({ seconds, from = 90, to = 30, seed }) {
  const len = n(seconds)
  const f = i => glide(from, to, Math.pow(i / len, 0.45))
  const x = sat(sum(osc(len, f), scale(osc(len, i => 2 * f(i)), 0.12)), 1.15)
  return edges(both(env(x, (t, i) => Math.min(1, i / n(0.004)) * Math.pow(1 - t, 1.3))), 0.004, 0.06)
}
function sweep({ seconds, peak = 0.6, low = 300, high = 3500, tone = 0.35, width = 0.8, rt60 = 1.2, seed }) {
  const len = n(seconds), p = n(seconds * peak), w = Math.max(n(0.08), p * 0.35)
  const band = i => (i < p ? glide(low, high, Math.pow(i / p, 1.5)) : glide(high, low * 1.3, (i - p) / (len - p)))
  const shape = (t, i) => (i < p ? Math.pow(i / p, 2.6) : Math.exp(-((i - p) / SR) / (seconds * (1 - peak) * 0.35)))
  const air = env(unit(biquad(pink(len, seed), 'band', band, 0.85)), shape)
  // a faint tone dropping in pitch as it passes (a doppler)
  const fTone = i => 0.5 * band(i) * (1 + 0.12 * Math.tanh((p - i) / w))
  const ton = env(unit(biquad(osc(len, fTone, 'saw'), 'low', i => band(i) * 1.5, 0.7)), shape)
  const moving = pan(sum(air, scale(ton, tone)), i => width * Math.tanh((i - p) / w))
  return edges(room(moving, { rt60, wet: 0.18, dark: 4000, seed: seed + 3 }).map(x => fit(x, len + n(0.4))), 0.01, 0.1)
}
function bed({ seconds = 10, kind, seed }) {
  const len = n(seconds), r = rng(seed)
  const slow = (rate, depth, s) => { const m = osc(len, rate, 'sine', Math.abs(rng(s)())); return m.map(v => 1 - depth * (0.5 + 0.5 * v)) }
  let l, rr
  if (kind === 'room') {
    const base = (s) => sum(scale(unit(biquad(brown(len, seed + s), 'low', 400)), 1), scale(unit(biquad(pink(len, seed + s + 3), 'band', 1800, 0.5)), 0.05))
    l = base(0); rr = base(10)
  } else if (kind === 'air') {
    const base = (s) => sum(unit(biquad(pink(len, seed + s), 'low', 900, 0.6)), scale(osc(len, 120, 'sine', s * 0.1), 0.06), scale(osc(len, 240), 0.02))
    l = base(0); rr = base(10)
  } else if (kind === 'wind') {
    const gust = slow(0.13, 0.7, seed + 4)
    const base = (s) => env(unit(biquad(pink(len, seed + s), 'band', i => 380 + 420 * (0.5 + 0.5 * Math.sin(TAU * 0.09 * i / SR + s)), 0.9)), (t, i) => gust[i])
    l = base(0); rr = base(7)
  } else if (kind === 'water') {
    // falling water: a broad roar with weight under it, and a bubbling
    // texture of many small bright splashes
    const roar = (s) => sum(unit(biquad(biquad(pink(len, seed + s), 'low', 3200, 0.6), 'high', 120)), scale(unit(biquad(brown(len, seed + s + 2), 'low', 300)), 0.6))
    l = roar(0); rr = roar(4)
    for (const side of [l, rr]) {
      for (let k = 0; k < seconds * 140; k++) {
        const at = Math.floor(Math.abs(r()) * (len - n(0.03)))
        const drop = env(biquad(white(n(0.025), seed + 300 + k), 'band', 500 + 2500 * Math.abs(r()), 4), t => Math.pow(1 - t, 2))
        for (let i = 0; i < drop.length; i++) side[at + i] += drop[i] * (0.3 + 0.5 * Math.abs(r()))
      }
    }
  } else if (kind === 'rain') {
    const hiss = (s) => unit(biquad(biquad(pink(len, seed + s), 'high', 900), 'low', 7000))
    l = hiss(0); rr = hiss(5)
    for (let k = 0; k < seconds * 60; k++) {
      const at = Math.floor(Math.abs(r()) * (len - n(0.02))), g = 0.4 + 0.6 * Math.abs(r()), side = r() > 0 ? l : rr
      const drop = env(biquad(white(n(0.015), seed + k), 'band', 2500 + 3000 * Math.abs(r()), 3), t => Math.pow(1 - t, 3))
      for (let i = 0; i < drop.length; i++) side[at + i] += drop[i] * g * 1.5
    }
  } else {
    // a city at night: a low rumble, cars passing now and then, a far hiss
    const rumble = (s) => unit(biquad(brown(len, seed + s), 'low', 220))
    l = rumble(0); rr = rumble(3)
    const hissS = (s) => scale(unit(biquad(pink(len, seed + 20 + s), 'band', 2500, 0.4)), 0.08)
    l = sum(l, hissS(0)); rr = sum(rr, hissS(1))
    for (let k = 0; k < Math.ceil(seconds / 3.5); k++) {
      const at = Math.floor((k + 0.2 + 0.6 * Math.abs(r())) / Math.ceil(seconds / 3.5) * len), d = n(3 + 2 * Math.abs(r())), dir = r() > 0 ? 1 : -1
      const car = env(unit(biquad(pink(d, seed + 40 + k), 'band', i => glide(700, 420, i / d), 0.7)), t => Math.pow(Math.sin(Math.PI * t), 3))
      const [cl, cr] = pan(scale(car, 0.55), i => dir * (2 * i / d - 1) * 0.8)
      for (let i = 0; i < d && at + i < len; i++) { l[at + i] += cl[i]; rr[at + i] += cr[i] }
    }
  }
  return edges([l, rr], 0.3, 0.3)
}

// ---- level -------------------------------------------------------------------------------

// Loudness as a meter weighs it (ITU BS.1770 K-weighting at 48 kHz): a
// high shelf, then a high-pass
function kWeight(x) {
  const stage = (v, b, a) => { const y = new Float64Array(v.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < v.length; i++) { const o = b[0] * v[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = v[i]; y2 = y1; y1 = o; y[i] = o } return y }
  return stage(stage(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]), [1, -2, 1], [1, -1.99004745483398, 0.99007225036621])
}
// The loudest 400 ms (momentary loudness, LUFS)
function loudestDb([l, r]) {
  const wl = kWeight(l), wr = kWeight(r), w = Math.min(n(0.4), wl.length), hop = n(0.1)
  let best = 1e-12
  for (let i = 0; i + w <= wl.length; i += hop) {
    let s = 0
    for (let k = i; k < i + w; k++) s += wl[k] * wl[k] + wr[k] * wr[k]
    best = Math.max(best, s / w)
  }
  return 10 * Math.log10(best) - 0.691
}
// The whole (ungated) loudness, for a bed
const allDb = ([l, r]) => 10 * Math.log10(rms(kWeight(l)) ** 2 + rms(kWeight(r)) ** 2) - 0.691
const peakOf = ([l, r]) => { let m = 0; for (const x of [l, r]) for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i])); return m || 1 }
// To its kind's loudness, its peak held to -1 dBFS
function level(s, kind) {
  const target = { riser: -20, swell: -20, sweep: -20, boom: -16, 'sub-drop': -20, bed: -30 }[kind]
  const now = kind === 'bed' ? allDb(s) : loudestDb(s)
  let g = Math.pow(10, (target - now) / 20)
  const cap = Math.pow(10, -1 / 20) / peakOf(s)
  g = Math.min(g, cap)
  return sscale(s, g)
}

// ---- the sounds -------------------------------------------------------------------------

// [name, make, where its cut is ('end', 0 or 'peak'), en, zh]
const SOUNDS = [
  ['riser-01', () => riser({ seconds: 1, octaves: 1, centre: 520, pulse: 0.3, cymbal: 0.5, seed: 1 }), 'end', 'A short riser: a bright tone climbing, air tightening, a reversed cymbal', '短的上升：明亮的音往上爬，气声收紧，反向的镲'],
  ['riser-02', () => riser({ seconds: 2, octaves: 1.5, centre: 330, seed: 2 }), 'end', 'A riser of a climbing Shepard tone, tightening air and a pulse speeding up', '一直往上爬的 Shepard 音、收紧的气声、越来越快的脉动'],
  ['riser-03', () => riser({ seconds: 2, octaves: 1, centre: 260, noise: 1.2, pulse: 0, cymbal: 0.9, seed: 3 }), 'end', 'A smooth riser, more air and cymbal than tone, no pulse', '平滑的上升，气声与镲多于音，没有脉动'],
  ['riser-04', () => riser({ seconds: 3, octaves: 2, centre: 300, pulse: 0.7, seed: 4 }), 'end', 'A long tense riser: two octaves of climb, a pulse racing at the end', '较长、紧张的上升：爬两个八度，结尾脉动越来越急'],
  ['riser-05', () => riser({ seconds: 4, octaves: 2, centre: 220, pulse: 0.5, noise: 0.6, seed: 5 }), 'end', 'A long, dark riser from low, building slowly', '很长、偏暗的上升，从低处慢慢推'],
  ['riser-06', () => riser({ seconds: 4, octaves: 1.5, centre: 440, pulse: 0.2, noise: 1, cymbal: 1, seed: 6 }), 'end', 'A long, bright, airy riser with a big reversed cymbal', '很长、明亮、带气声的上升，反向的大镲'],
  ['riser-07', () => riser({ seconds: 3, octaves: 1, centre: 180, pulse: 0.6, noise: 0.5, cymbal: 0.4, seed: 7 }), 'end', 'A low, heavy riser with a pulse, little air', '低而重的上升，有脉动，气声少'],
  ['riser-08', () => riser({ seconds: 1.5, octaves: 1, centre: 400, pulse: 0.4, seed: 8 }), 'end', 'A quick riser for a fast film', '快片子用的短上升'],
  ['swell-01', () => swell({ seconds: 1, source: 'cymbal', rt60: 1.6, seed: 11 }), 'end', 'A short reversed cymbal drawn into the cut', '短的反向镲，被吸进切点'],
  ['swell-02', () => swell({ seconds: 2, source: 'cymbal', rt60: 2.8, seed: 12 }), 'end', 'A reversed cymbal in a large hall', '大厅里一下镲的混响倒放'],
  ['swell-03', () => swell({ seconds: 2, source: 'chord', root: 220, rt60: 3, seed: 13 }), 'end', 'A reversed struck chord: tonal, soft, drawn in', '一下和弦的倒放：有音调、柔和'],
  ['swell-04', () => swell({ seconds: 3, source: 'chord', root: 110, rt60: 4, seed: 14 }), 'end', 'A long reversed low chord', '较长的低和弦倒放'],
  ['swell-05', () => swell({ seconds: 2, source: 'boom', rt60: 3, seed: 15 }), 'end', 'A reversed boom: dark and heavy, sucked into the cut', '一下重击的倒放：暗而重，被吸进切点'],
  ['swell-06', () => swell({ seconds: 3, source: 'cymbal', rt60: 4.5, seed: 16 }), 'end', 'A long reversed cymbal from a very large space', '很大的空间里镲的长混响倒放'],
  ['swell-07', () => swell({ seconds: 1.5, source: 'chord', root: 440, rt60: 2, seed: 17 }), 'end', 'A short, bright reversed chord', '短而亮的和弦倒放'],
  ['swell-08', () => swell({ seconds: 2.5, source: 'boom', rt60: 4, seed: 18 }), 'end', 'A long reversed boom', '较长的重击倒放'],
  ['boom-01', () => boom({ seconds: 2, low: 150, to: 40, body: 0.45, metal: 0.25, seed: 41 }), 0, 'A cinematic hit: a click, a low thump falling away, a hall tail', '电影式的一击：一下起音、往下落的低频、大厅的尾巴'],
  ['boom-02', () => boom({ seconds: 3, low: 120, to: 32, body: 0.8, metal: 0.4, rt60: 4, seed: 42 }), 0, 'A big, deep hit with a metal ring and a long tail: the reveal', '大而深的一击，带金属余韵与长尾：揭示用'],
  ['boom-03', () => boom({ seconds: 1.5, low: 180, to: 55, body: 0.25, metal: 0, thud: 0.9, rt60: 1.5, wet: 0.2, seed: 43 }), 0, 'A tight, short hit, little tail: a title landing', '紧而短的一击，尾巴短：标题落下'],
  ['boom-04', () => boom({ seconds: 2.5, low: 140, to: 36, body: 0.6, metal: 0.7, seed: 44 }), 0, 'A hit with a strong metal ring', '金属感强的一击'],
  ['boom-05', () => boom({ seconds: 2, low: 100, to: 30, body: 0.6, metal: 0, click: 0.2, seed: 45 }), 0, 'A soft, dark, round hit, almost no click', '柔和、暗、圆的一击，几乎没有起音的咔'],
  ['boom-06', () => boom({ seconds: 3, low: 160, to: 38, body: 0.7, metal: 0.3, rt60: 5, wet: 0.5, seed: 46 }), 0, 'A hit in a huge space, a very long tail', '巨大空间里的一击，尾巴很长'],
  ['boom-07', () => boom({ seconds: 1.5, low: 220, to: 60, body: 0.2, metal: 0.15, thud: 0.4, click: 0.9, rt60: 1.2, wet: 0.2, seed: 47 }), 0, 'A light, crisp hit for a fast film', '轻、脆的一击，快片子用'],
  ['boom-08', () => boom({ seconds: 2.5, low: 130, to: 34, body: 0.55, metal: 0.2, seed: 48 }), 0, 'A medium cinematic hit', '中等分量的电影式一击'],
  ['sub-drop-01', () => subDrop({ seconds: 1, from: 110, to: 40, seed: 21 }), 0, 'A short sub drop from 110 to 40 Hz', '短的低音下落，从 110 Hz 到 40 Hz'],
  ['sub-drop-02', () => subDrop({ seconds: 1.5, from: 90, to: 32, seed: 22 }), 0, 'A sub drop from 90 to 32 Hz', '低音从 90 Hz 落到 32 Hz'],
  ['sub-drop-03', () => subDrop({ seconds: 2, from: 80, to: 28, seed: 23 }), 0, 'A long sub drop from 80 to 28 Hz', '较长的低音，从 80 Hz 落到 28 Hz'],
  ['sub-drop-04', () => subDrop({ seconds: 3, from: 75, to: 25, seed: 24 }), 0, 'A very long sub drop from 75 to 25 Hz', '很长的低音下落，从 75 Hz 到 25 Hz'],
  ['sub-drop-05', () => subDrop({ seconds: 0.7, from: 140, to: 50, seed: 25 }), 0, 'A short, punchy drop from 140 to 50 Hz', '短促的下落，从 140 Hz 到 50 Hz'],
  ['sub-drop-06', () => subDrop({ seconds: 2, from: 120, to: 35, seed: 26 }), 0, 'A sub drop from 120 to 35 Hz', '低音从 120 Hz 落到 35 Hz'],
  ['sub-drop-07', () => subDrop({ seconds: 1.2, from: 70, to: 30, seed: 27 }), 0, 'A deep, short sub drop from 70 to 30 Hz', '深而短的低音，从 70 Hz 到 30 Hz'],
  ['sub-drop-08', () => subDrop({ seconds: 2.5, from: 100, to: 30, seed: 28 }), 0, 'A long sub drop from 100 to 30 Hz', '较长的低音，从 100 Hz 落到 30 Hz'],
  ['sweep-01', () => sweep({ seconds: 0.8, peak: 0.6, low: 400, high: 4500, seed: 31 }), 'peak', 'A short pass-by, left to right, airy', '短的掠过，从左到右，带气声'],
  ['sweep-02', () => sweep({ seconds: 1, peak: 0.6, low: 300, high: 3500, seed: 32 }), 'peak', 'A pass-by, left to right, its pitch dropping as it goes', '掠过，从左到右，过去时音高往下'],
  ['sweep-03', () => sweep({ seconds: 1.2, peak: 0.6, low: 250, high: 2800, tone: 0.6, seed: 33 }), 'peak', 'A pass-by with more tone, like something big flying past', '音调更重的掠过，像大的东西飞过'],
  ['sweep-04', () => sweep({ seconds: 1.5, peak: 0.65, low: 160, high: 2200, rt60: 1.8, seed: 34 }), 'peak', 'A long, low, heavy pass-by', '较长、低、重的掠过'],
  ['sweep-05', () => sweep({ seconds: 2, peak: 0.7, low: 140, high: 3000, rt60: 2, seed: 35 }), 'peak', 'A slow pass-by with a long tail in a room', '慢的掠过，在空间里拖长尾'],
  ['sweep-06', () => sweep({ seconds: 0.9, peak: 0.55, low: 700, high: 7000, tone: 0.2, seed: 36 }), 'peak', 'A fast, bright, light pass-by', '快、亮、轻的掠过'],
  ['sweep-07', () => sweep({ seconds: 1, peak: 0.6, low: 300, high: 3500, width: -0.8, seed: 37 }), 'peak', 'A pass-by, right to left', '掠过，从右到左'],
  ['sweep-08', () => sweep({ seconds: 0.6, peak: 0.5, low: 600, high: 6000, tone: 0.15, rt60: 0.8, seed: 38 }), 'peak', 'A very short flick, left to right', '很短的一甩，从左到右'],
  ['bed-01', () => bed({ kind: 'room', seed: 51 }), 0, 'A quiet room: soft low air, nothing in it (room tone)', '安静的房间：轻轻的低频空气声，里面什么都没有（房间底噪）'],
  ['bed-02', () => bed({ kind: 'room', seed: 52 }), 0, 'A quiet room, another take', '安静的房间，另一段'],
  ['bed-03', () => bed({ kind: 'air', seed: 53 }), 0, 'Inside a building: air conditioning and a faint hum', '楼里：空调的风与很轻的嗡声'],
  ['bed-04', () => bed({ kind: 'city', seed: 54 }), 0, 'A city at night from a window: a low rumble, cars passing now and then', '窗外的夜晚城市：低沉的底噪，偶尔有车开过'],
  ['bed-05', () => bed({ kind: 'city', seed: 55 }), 0, 'A city at night, another take', '夜晚的城市，另一段'],
  ['bed-06', () => bed({ kind: 'wind', seed: 56 }), 0, 'Wind outside, in slow gusts', '外面的风，一阵一阵'],
  ['bed-07', () => bed({ kind: 'rain', seed: 57 }), 0, 'Steady rain', '持续的雨'],
  ['bed-08', () => bed({ kind: 'water', seed: 58 }), 0, 'A waterfall or a river close by: a broad roar of falling water', '近处的瀑布或河流：落水的宽厚轰声']
]
const TAG = { riser: 'riser', swell: 'swell', boom: 'impact', 'sub-drop': 'sub-drop', sweep: 'sweep', bed: 'ambience' }
const WHERE = { riser: ['its end', '结尾'], swell: ['its end', '结尾'], boom: ['its attack', '起音'], 'sub-drop': ['its start', '开头'], sweep: ['its peak', '峰值'], bed: ['its start', '开头'] }
const NOUN = { riser: ['Riser', '上升'], swell: ['Swell', '吸入'], boom: ['Boom', '重击'], 'sub-drop': ['Sub drop', '低音下落'], sweep: ['Sweep', '掠过'], bed: ['Bed', '环境'] }
const kindOf = name => name.replace(/-\d\d$/, '')

// Its cut in seconds: the end, 0, or the middle of the loudest 10 ms
function cutOf([l, r], where) {
  if (where === 'end') return Math.round(l.length / SR * 1000) / 1000
  if (typeof where === 'number') return where
  const w = n(0.01)
  let best = 0, at = 0
  for (let i = 0; i + w <= l.length; i += w) { let s = 0; for (let k = i; k < i + w; k++) s += l[k] * l[k] + r[k] * r[k]; if (s > best) { best = s; at = i } }
  return Math.round((at + w / 2) / SR * 1000) / 1000
}

export function make(name) {
  const s = SOUNDS.find(x => x[0] === name)
  if (!s) throw new Error(`${name} is not one of the sounds`)
  const made = level(s[1](), kindOf(name))
  return { channels: made, cut: cutOf(made, s[2]), seconds: Math.round(made[0].length / SR * 1000) / 1000, en: s[3], zh: s[4] }
}

function wav(file, [l, r]) {
  const len = l.length, buf = Buffer.alloc(44 + len * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + len * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(len * 4, 40)
  const q = v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))
  for (let i = 0; i < len; i++) { buf.writeInt16LE(q(l[i]), 44 + i * 4); buf.writeInt16LE(q(r[i]), 46 + i * 4) }
  fs.writeFileSync(file, buf)
}

function writePack(name) {
  const kind = kindOf(name), nn = Number(name.slice(-2))
  const { channels, cut, seconds, en, zh } = make(name)
  const dir = path.join(ROOT, 'emile', name)
  fs.mkdirSync(dir, { recursive: true })
  wav(path.join(dir, 'sound.wav'), channels)
  const pack = {
    id: `emile/${name}`, kind: 'sound', version: '1.0.1',
    title: { en: `${NOUN[kind][0]} ${nn}`, 'zh-CN': `${NOUN[kind][1]} ${nn}` },
    description: { en: `${en} (${seconds.toFixed(2)} s; the cut at ${WHERE[kind][0]}, ${cut.toFixed(3)} s). Synthesised by Émile.`, 'zh-CN': `${zh}（${seconds.toFixed(2)} 秒；切点在${WHERE[kind][1]}，${cut.toFixed(3)} 秒）。Émile 合成。` },
    params: [],
    sound: { file: 'sound.wav', seconds, cut, tags: [TAG[kind]] },
    sources: [{ name: 'Émile, synthesised by scripts/transitions.mjs', url: 'https://github.com/EmileFilm/emile-packs/blob/main/scripts/transitions.mjs', licence: 'CC0-1.0' }],
    licence: 'CC0-1.0', publisher: 'emile'
  }
  fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n')
  console.log(`emile/${name}: ${pack.description.en}`)
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--out')
  const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')
  const names = SOUNDS.map(s => s[0]).filter(x => !only.length || only.includes(x))
  if (at < 0) for (const name of names) writePack(name)
  else {
    const out = args[at + 1]
    fs.mkdirSync(out, { recursive: true })
    for (const name of names) {
      const { channels, cut, seconds } = make(name)
      wav(path.join(out, `${name}.wav`), channels)
      console.log(`${name}: ${seconds.toFixed(2)} s, cut at ${cut.toFixed(3)} s`)
    }
  }
}
