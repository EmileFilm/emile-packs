#!/usr/bin/env node
// Synthesises the transition sounds (Émile's docs/TECH.md §12.1 乐器与音效):
// four kinds the CC0 catalogue had nothing for, each made so the moment it
// meets the cut is known exactly (its `cut`, seconds into the file):
//
//   riser     builds for 1–4 s and is loudest at its very end: the cut
//   swell     a reversed reverb: a hit's tail drawn in, ending on the cut
//   sub-drop  a low sine falling away from the cut (cut at 0), under a hit
//   sweep     a long whoosh: rises, passes, trails off; the cut at its peak
//
// The same code makes the same file every time (a seeded noise), 48 kHz
// 16-bit stereo, peak at -1 dBFS.
//
//   node scripts/transitions.mjs                  (every one, as packs: emile/<kind>-<nn>/)
//   node scripts/transitions.mjs --out <folder>   (every one as a WAV, to listen)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SR = 48000
const ROOT = path.resolve(import.meta.dirname, '..')

// ---- small DSP ------------------------------------------------------------

function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0
    return s / 4294967296 * 2 - 1
  }
}
const n = s => Math.round(s * SR)
const noise = (len, seed) => { const r = rng(seed), x = new Float64Array(len); for (let i = 0; i < len; i++) x[i] = r(); return x }

// A biquad band-pass or low-pass whose frequency follows f(i) (RBJ)
function filter(x, kind, f, q = 0.9) {
  const y = new Float64Array(x.length)
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < x.length; i++) {
    const w = 2 * Math.PI * Math.min(f(i), SR * 0.45) / SR, c = Math.cos(w), a = Math.sin(w) / (2 * q)
    let b0, b1, b2
    if (kind === 'band') { b0 = a; b1 = 0; b2 = -a } else if (kind === 'high') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2 } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2 }
    const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v
  }
  return y
}
// Exponential glide from a to b over t in 0..1
const glide = (a, b, t) => a * Math.pow(b / a, t)

// Oscillators whose frequency follows f(i): phase accumulated
function osc(len, f, shape = 'sine', phase0 = 0) {
  const y = new Float64Array(len)
  let p = phase0
  for (let i = 0; i < len; i++) {
    p += f(i) / SR; p -= Math.floor(p)
    y[i] = shape === 'saw' ? 2 * p - 1 : shape === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : Math.sin(2 * Math.PI * p)
  }
  return y
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
    const ang = 2 * Math.PI / len * (inverse ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang)
    for (let i = 0; i < N; i += len) {
      let cr = 1, ci = 0
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr
        re[i + k + len / 2] = re[i + k] - ar; im[i + k + len / 2] = im[i + k] - ai
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
// A hall's response: decaying noise, darker as it goes (rt60 in seconds)
function hall(rt60, seed, dark = 3000) {
  const len = n(rt60 * 1.1), x = noise(len, seed)
  for (let i = 0; i < len; i++) x[i] *= Math.pow(10, -3 * (i / SR) / rt60)
  return filter(x, 'low', i => glide(dark * 3, dark / 3, i / len), 0.7)
}

const mix = (...xs) => { const y = new Float64Array(Math.max(...xs.map(x => x.length))); for (const x of xs) for (let i = 0; i < x.length; i++) y[i] += x[i]; return y }
const scale = (x, g) => x.map(v => v * g)
const env = (x, f) => x.map((v, i) => v * f(i / x.length, i))
const peakOf = x => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0)
const reverse = x => x.slice().reverse()
const soft = (x, drive) => x.map(v => Math.tanh(v * drive) / Math.tanh(drive))
const rms = x => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length)
const fit = (x, len) => { const y = new Float64Array(len); y.set(x.subarray(0, Math.min(len, x.length))); return y }

// A short fade at both ends so nothing clicks; `keep` the end hard (a cut)
function edges(x, { head = 0.004, tail = 0.004 } = {}) {
  const h = n(head), t = n(tail)
  for (let i = 0; i < h && i < x.length; i++) x[i] *= i / h
  for (let i = 0; i < t && i < x.length; i++) x[x.length - 1 - i] *= i / t
  return x
}

// ---- the four kinds ---------------------------------------------------------

// Noise opening upward, a tone climbing under it, loudest at the end
function riser({ seconds, from = 300, to = 9000, tone = 0.5, octave = 1.5, root = 110, seed }) {
  const len = n(seconds)
  const air = filter(noise(len, seed), 'band', i => glide(from, to, i / len), 1.2)
  const climb = i => glide(root, root * Math.pow(2, octave), Math.pow(i / len, 1.6))
  const saws = mix(osc(len, climb, 'saw'), osc(len, i => climb(i) * 1.007, 'saw', 0.3), osc(len, i => climb(i) * 0.993, 'saw', 0.6), scale(osc(len, i => climb(i) * 2, 'saw', 0.1), 0.5))
  const voiced = filter(saws, 'low', i => glide(400, 7000, i / len), 0.8)
  const body = mix(scale(air, 1 / Math.max(1e-9, rms(air))), scale(voiced, tone / Math.max(1e-9, rms(voiced))))
  return edges(env(body, t => Math.pow(t, 2.2) * (0.05 + 0.95 * t)), { head: 0.05, tail: 0.003 })
}

// A hit (noise, tone or thump) through a long hall, turned round: drawn in
function swell({ seconds, hit = 'noise', rt60 = 2.5, dark = 3000, root = 220, seed }) {
  const strike = n(0.08)
  let src
  if (hit === 'noise') src = env(noise(strike, seed), t => Math.pow(1 - t, 3))
  else if (hit === 'thump') src = env(osc(strike * 3, i => glide(120, 45, i / (strike * 3))), t => Math.pow(1 - t, 2))
  else src = env(mix(osc(strike * 4, () => root), scale(osc(strike * 4, () => root * 1.5), 0.6), scale(osc(strike * 4, () => root * 2.01), 0.4), scale(noise(strike * 4, seed), 0.15)), t => Math.pow(1 - t, 1.5))
  const wet = convolve(src, hall(rt60, seed + 7, dark))
  const tail = reverse(fit(wet, n(seconds)))
  return edges(env(tail, t => Math.pow(t, 0.6)), { head: 0.08, tail: 0.003 })
}

// A sine falling from `from` to `to` Hz, a click on its front, a little
// grit so a small speaker hears it
function subDrop({ seconds, from = 110, to = 32, click = 0.3, grit = 1.8, seed }) {
  const len = n(seconds)
  const body = osc(len, i => glide(from, to, Math.pow(i / len, 0.5)))
  const tick = env(filter(noise(n(0.012), seed), 'high', () => 2500), t => 1 - t)
  const sum = mix(soft(env(body, t => Math.pow(1 - t, 1.4)), grit), scale(tick, click))
  return edges(sum, { head: 0.002, tail: 0.05 })
}

// Noise whose band rises and falls as it passes, loudest at `peak` (share
// of its length): a long whoosh with a little stereo spread
function sweep({ seconds, peak = 0.6, low = 250, high = 4500, q = 1.4, rough = 0, seed }) {
  const len = n(seconds), p = n(seconds * peak)
  const band = i => i < p ? glide(low, high, i / p) : glide(high, low * 1.5, (i - p) / (len - p))
  const shape = (t, i) => i < p ? Math.pow(i / p, 2.4) : Math.pow(1 - (i - p) / (len - p), 1.8)
  const side = (s) => {
    let x = filter(noise(len, seed + s), 'band', band, q)
    if (rough) x = mix(x, scale(env(noise(len, seed + 11 + s), (t, i) => (Math.sin(i / SR * 2 * Math.PI * 23) > 0.6 ? 1 : 0.2)), rough * rms(x)))
    return env(x, shape)
  }
  return [side(0), side(1)]
}

// ---- the candidates ---------------------------------------------------------

// The cut is where each meets the picture's change: a riser's and a swell's
// end, a sub-drop's start, a sweep's peak
const CANDIDATES = [
  ['riser-a', () => riser({ seconds: 1, from: 500, to: 9000, tone: 0.3, octave: 1, root: 220, seed: 1 }), 'end'],
  ['riser-b', () => riser({ seconds: 2, from: 300, to: 8000, tone: 0.5, octave: 1.5, root: 110, seed: 2 }), 'end'],
  ['riser-c', () => riser({ seconds: 2, from: 200, to: 6000, tone: 0, seed: 3 }), 'end'],
  ['riser-d', () => riser({ seconds: 3, from: 250, to: 9000, tone: 0.7, octave: 2, root: 82.4, seed: 4 }), 'end'],
  ['riser-e', () => riser({ seconds: 4, from: 150, to: 10000, tone: 0.5, octave: 2, root: 55, seed: 5 }), 'end'],
  ['riser-f', () => riser({ seconds: 4, from: 400, to: 7000, tone: 1.2, octave: 1, root: 146.8, seed: 6 }), 'end'],
  ['riser-g', () => riser({ seconds: 3, from: 800, to: 12000, tone: 0.2, octave: 2.5, root: 440, seed: 7 }), 'end'],
  ['riser-h', () => riser({ seconds: 1.5, from: 300, to: 6000, tone: 0.9, octave: 1, root: 98, seed: 8 }), 'end'],
  ['swell-a', () => swell({ seconds: 1, hit: 'noise', rt60: 1.5, dark: 4000, seed: 11 }), 'end'],
  ['swell-b', () => swell({ seconds: 2, hit: 'noise', rt60: 2.5, dark: 2500, seed: 12 }), 'end'],
  ['swell-c', () => swell({ seconds: 2, hit: 'tone', rt60: 2.5, root: 220, dark: 3500, seed: 13 }), 'end'],
  ['swell-d', () => swell({ seconds: 3, hit: 'tone', rt60: 3.5, root: 110, dark: 2500, seed: 14 }), 'end'],
  ['swell-e', () => swell({ seconds: 2, hit: 'thump', rt60: 2.5, dark: 1500, seed: 15 }), 'end'],
  ['swell-f', () => swell({ seconds: 3, hit: 'noise', rt60: 4, dark: 1800, seed: 16 }), 'end'],
  ['swell-g', () => swell({ seconds: 1.5, hit: 'tone', rt60: 2, root: 440, dark: 6000, seed: 17 }), 'end'],
  ['swell-h', () => swell({ seconds: 2.5, hit: 'thump', rt60: 3.5, dark: 1200, seed: 18 }), 'end'],
  ['sub-drop-a', () => subDrop({ seconds: 1, from: 120, to: 40, seed: 21 }), 0],
  ['sub-drop-b', () => subDrop({ seconds: 1.5, from: 100, to: 32, seed: 22 }), 0],
  ['sub-drop-c', () => subDrop({ seconds: 2, from: 90, to: 28, click: 0.5, seed: 23 }), 0],
  ['sub-drop-d', () => subDrop({ seconds: 3, from: 80, to: 25, grit: 2.5, seed: 24 }), 0],
  ['sub-drop-e', () => subDrop({ seconds: 0.6, from: 160, to: 50, click: 0.6, seed: 25 }), 0],
  ['sub-drop-f', () => subDrop({ seconds: 2, from: 140, to: 35, grit: 1.2, click: 0, seed: 26 }), 0],
  ['sub-drop-g', () => subDrop({ seconds: 1.2, from: 70, to: 30, grit: 3, seed: 27 }), 0],
  ['sub-drop-h', () => subDrop({ seconds: 2.5, from: 110, to: 30, grit: 2, click: 0.4, seed: 28 }), 0],
  ['sweep-a', () => sweep({ seconds: 0.8, peak: 0.6, low: 400, high: 5000, seed: 31 }), 'peak'],
  ['sweep-b', () => sweep({ seconds: 1, peak: 0.55, low: 250, high: 4000, seed: 32 }), 'peak'],
  ['sweep-c', () => sweep({ seconds: 1.2, peak: 0.6, low: 200, high: 3000, q: 2, seed: 33 }), 'peak'],
  ['sweep-d', () => sweep({ seconds: 1.5, peak: 0.65, low: 150, high: 2500, q: 1, seed: 34 }), 'peak'],
  ['sweep-e', () => sweep({ seconds: 2, peak: 0.7, low: 120, high: 3500, q: 1.2, seed: 35 }), 'peak'],
  ['sweep-f', () => sweep({ seconds: 1, peak: 0.5, low: 600, high: 8000, q: 1.6, seed: 36 }), 'peak'],
  ['sweep-g', () => sweep({ seconds: 1.2, peak: 0.6, low: 300, high: 4000, rough: 0.6, seed: 37 }), 'peak'],
  ['sweep-h', () => sweep({ seconds: 0.7, peak: 0.5, low: 500, high: 7000, q: 2.5, seed: 38 }), 'peak']
]

// Two channels: a sweep is made in two takes; the others are the same in both
const stereo = made => (Array.isArray(made) ? made : [made, made])

function wav(file, [l, r]) {
  const len = l.length, peak = Math.max(peakOf(l), peakOf(r)) || 1, g = Math.pow(10, -1 / 20) / peak
  const buf = Buffer.alloc(44 + len * 4)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + len * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(len * 4, 40)
  for (let i = 0; i < len; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(l[i] * g * 32767))), 44 + i * 4)
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r[i] * g * 32767))), 46 + i * 4)
  }
  fs.writeFileSync(file, buf)
}

// The cut in seconds: the end, 0, or the loudest 10 ms (a sweep's peak)
function cutOf([l], where) {
  if (where === 'end') return Math.round(l.length / SR * 1000) / 1000
  if (typeof where === 'number') return where
  const w = n(0.01)
  let best = 0, at = 0
  for (let i = 0; i + w <= l.length; i += w) { let s = 0; for (let k = i; k < i + w; k++) s += l[k] * l[k]; if (s > best) { best = s; at = i } }
  return Math.round((at + w / 2) / SR * 1000) / 1000
}

export function make(name) {
  const c = CANDIDATES.find(x => x[0] === name)
  if (!c) throw new Error(`${name} is not a candidate`)
  const made = stereo(c[1]())
  return { channels: made, cut: cutOf(made, c[2]), seconds: Math.round(made[0].length / SR * 1000) / 1000 }
}

// What each sounds like, for the AI choosing by it: [en, zh-CN]
const SAYS = {
  'riser-a': ['A short bright riser, noise opening upward over a thin climbing tone', '短而亮的上升：噪声往上打开，下面一层细的音往上爬'],
  'riser-b': ['A riser of noise and a climbing synth chord, an octave and a half', '噪声加一组往上爬一个半八度的合成器和弦'],
  'riser-c': ['A riser of noise alone, opening from dark to bright', '只有噪声的上升，从暗打开到亮'],
  'riser-d': ['A long riser with a strong climbing synth chord, two octaves', '较长的上升，合成器和弦往上爬两个八度，音调感强'],
  'riser-e': ['A long, slow riser from very low, noise and a deep chord climbing two octaves', '很长很慢的上升，从很低处起，噪声与低沉的和弦往上爬两个八度'],
  'riser-f': ['A long riser carried by its chord more than its noise, one octave', '很长的上升，主要是和弦（一个八度），噪声在后'],
  'riser-g': ['A long, high, airy riser, thin noise and a high tone climbing far', '较长、偏高偏亮的上升，细的噪声与一个高音爬得很远'],
  'riser-h': ['A short riser led by a low chord, one octave', '短的上升，以低和弦为主，一个八度'],
  'swell-a': ['A short reversed swell of noise, drawn into the cut', '短的反向噪声，被吸进切点'],
  'swell-b': ['A reversed swell of noise from a large hall', '大厅里一下噪声的混响倒放'],
  'swell-c': ['A reversed swell of a struck chord: tonal, drawn in', '一下敲出的和弦倒放：有音调，被吸进去'],
  'swell-d': ['A long reversed swell of a low struck chord', '较长的低和弦倒放'],
  'swell-e': ['A reversed swell of a low thump: dark and heavy', '一下闷响的倒放：暗而重'],
  'swell-f': ['A long, dark reversed swell of noise from a very large hall', '很大的空间里噪声的长混响倒放，偏暗'],
  'swell-g': ['A short, bright reversed swell of a high struck chord', '短而亮的高和弦倒放'],
  'swell-h': ['A long reversed swell of a deep thump', '较长的低沉闷响倒放'],
  'sub-drop-a': ['A sub drop falling from 120 to 40 Hz with a click on its front', '低音从 120 Hz 落到 40 Hz，前面一下咔嗒'],
  'sub-drop-b': ['A sub drop falling from 100 to 32 Hz', '低音从 100 Hz 落到 32 Hz'],
  'sub-drop-c': ['A long sub drop from 90 to 28 Hz with a firm click on its front', '较长的低音从 90 Hz 落到 28 Hz，前面一下清楚的咔嗒'],
  'sub-drop-d': ['A very long, gritty sub drop from 80 to 25 Hz', '很长、带颗粒的低音，从 80 Hz 落到 25 Hz'],
  'sub-drop-e': ['A short, punchy drop from 160 to 50 Hz with a sharp click', '短促有力的下落，从 160 Hz 到 50 Hz，前面一下脆的咔嗒'],
  'sub-drop-f': ['A smooth sub drop from 140 to 35 Hz, no click', '平滑的低音下落，从 140 Hz 到 35 Hz，没有咔嗒'],
  'sub-drop-g': ['A heavily driven low drop from 70 to 30 Hz', '失真重的低音下落，从 70 Hz 到 30 Hz'],
  'sub-drop-h': ['A long, driven sub drop from 110 to 30 Hz with a click', '较长、带失真的低音，从 110 Hz 落到 30 Hz，前面一下咔嗒'],
  'sweep-a': ['A short airy whoosh passing by', '短的、带气声的扫过'],
  'sweep-b': ['A whoosh passing by, mid-weight', '中等分量的扫过'],
  'sweep-c': ['A narrow, tonal whoosh passing by', '窄带、有点音调感的扫过'],
  'sweep-d': ['A long, low, broad whoosh', '较长、低沉、宽的扫过'],
  'sweep-e': ['A long slow whoosh with a late peak and a long tail', '很长很慢的扫过，峰值靠后，拖尾长'],
  'sweep-f': ['A fast, bright, high whoosh', '快、亮、偏高的扫过'],
  'sweep-g': ['A whoosh with a rough flutter in it, like air through a gap', '带粗糙颤动的扫过，像风穿过缝隙'],
  'sweep-h': ['A very short, bright, narrow whoosh: a flick', '很短、亮、窄的扫过：一甩'],
}
const NOUN = { riser: ['Riser', '上升'], swell: ['Swell', '吸入'], 'sub-drop': ['Sub drop', '低音下落'], sweep: ['Sweep', '长扫过'] }
const WHERE = { riser: ['its end', '结尾'], swell: ['its end', '结尾'], 'sub-drop': ['its start', '开头'], sweep: ['its peak', '峰值'] }

function writePack(name) {
  const kind = name.replace(/-[a-h]$/, ''), nn = 'abcdefgh'.indexOf(name.at(-1)) + 1
  const id = `${kind}-${String(nn).padStart(2, '0')}`
  const { channels, cut, seconds } = make(name)
  const dir = path.join(ROOT, 'emile', id)
  fs.mkdirSync(dir, { recursive: true })
  wav(path.join(dir, 'sound.wav'), channels)
  const [en, zh] = SAYS[name]
  const pack = {
    id: `emile/${id}`, kind: 'sound', version: '1.0.0',
    title: { en: `${NOUN[kind][0]} ${nn}`, 'zh-CN': `${NOUN[kind][1]} ${nn}` },
    description: { en: `${en} (${seconds.toFixed(2)} s; the cut at ${WHERE[kind][0]}, ${cut.toFixed(3)} s). Synthesised by Émile.`, 'zh-CN': `${zh}（${seconds.toFixed(2)} 秒；切点在${WHERE[kind][1]}，${cut.toFixed(3)} 秒）。Émile 合成。` },
    params: [],
    sound: { file: 'sound.wav', seconds, cut, tags: [kind] },
    sources: [{ name: 'Émile, synthesised by scripts/transitions.mjs', url: 'https://github.com/EmileFilm/emile-packs/blob/main/scripts/transitions.mjs', licence: 'CC0-1.0' }],
    licence: 'CC0-1.0', publisher: 'emile'
  }
  fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n')
  console.log(`emile/${id}: ${pack.description.en}`)
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2)
  const at = args.indexOf('--out')
  if (at < 0) for (const [name] of CANDIDATES) writePack(name)
  if (at >= 0) {
    const out = args[at + 1]
    fs.mkdirSync(out, { recursive: true })
    for (const [name] of CANDIDATES) {
      const { channels, cut, seconds } = make(name)
      wav(path.join(out, `${name}.wav`), channels)
      console.log(`${name}: ${seconds.toFixed(2)} s, cut at ${cut.toFixed(3)} s`)
    }
  }
}
