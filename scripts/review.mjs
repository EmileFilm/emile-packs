#!/usr/bin/env node
// The review a filter goes through before it is published (README, "The
// bar"): its sheet to look at, and what can be measured of it.
//
//   node scripts/review.mjs --out <folder outside this repository> [name…]
//       [--photo <file>]… [--set <name>.<param>=<value>]… [--quick]
//       [--no-measure] [--engine <Emile/engine>]
//
// Each filter is drawn by Émile's own compositor over pictures made here
// (scripts/review.html: a product on a backdrop by day and by night, a
// product's screen, shapes on nothing) and over each --photo (portraits
// above all: a face is where a filter fails first). --set draws a filter
// with a parameter at another value than its default, to try the settings
// a SKILL.md recommends on the kind of picture it recommends them for:
//
//   <out>/<name>.jpg   every picture as it is, at the filter's defaults and
//                      at amount 0.5; three pieces of the 1080p frame
//                      pixel for pixel; the upright and the square frame,
//                      and the shapes on nothing
//   <out>/gallery-<picture>.jpg   one picture under every filter's default:
//                      which filters suit that kind of picture
//   <out>/report.json  the measures, and which of them a filter fails
//
// The measures (the look itself is judged by eye, from the sheet):
//
//   amount 0    the frame is the picture's own, byte for byte
//   twice       one frame drawn twice is the same frame
//   still       a filter that isn't animated changes nothing from frame to frame
//   pumping     an animated one doesn't make the whole frame's brightness wander
//   sizes       720p and 4K, each drawn at its own size, look alike
//   ms          a 1080p frame costs under 4 ms more
//
// and, picture by picture, where a filter at its defaults is weak (△):
//
//   range       under 0.7 of the picture's run from dark to light is left
//   keeps       the picture is hard to find in it (the order of brightness
//               over a 96 × 54 grid follows the original's with a rank
//               correlation under 0.6)
//
// A ✗ keeps a filter out. A △ is answered in its SKILL.md: the kind of
// picture goes under 不适合, or the setting that mends it is given (and
// tried with --set).

import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    photo: { type: 'string', multiple: true },
    set: { type: 'string', multiple: true },
    quick: { type: 'boolean' },
    'no-measure': { type: 'boolean' },
    engine: { type: 'string' }
  }
})
const fail = message => {
  console.error(`review: ${message}`)
  process.exit(1)
}
if (!values.out) fail('--out <folder>: where the sheets go (outside this repository)')
const out = path.resolve(values.out)
if (!path.relative(ROOT, out).startsWith('..')) fail('--out is inside this repository: the sheets are looked at, not published')
fs.mkdirSync(out, { recursive: true })

const engine = path.resolve(values.engine ?? process.env.EMILE_ENGINE ?? path.join(ROOT, '..', 'Emile', 'engine'))
if (!fs.existsSync(path.join(engine, 'emile', 'compose', 'compositor.js'))) fail(`no engine at ${engine} (--engine or EMILE_ENGINE: the Émile repository's engine/)`)
const { launchBrowser } = await import(pathToFileURL(path.join(engine, 'lib', 'chrome.mjs')).href)

// Every filter pack of this repository, or the ones named
const all = {}
for (const pub of fs.readdirSync(ROOT, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'scripts')) {
  for (const e of fs.readdirSync(path.join(ROOT, pub.name), { withFileTypes: true })) {
    const file = path.join(ROOT, pub.name, e.name, 'pack.json')
    if (!e.isDirectory() || !fs.existsSync(file)) continue
    const pack = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (pack.kind !== 'filter') continue
    all[pack.id] = { kind: pack.kind, category: pack.category, animated: !!pack.animated, params: pack.params, glsl: fs.readFileSync(path.join(ROOT, pub.name, e.name, pack.backends.glsl), 'utf8') }
  }
}
const ORDER = ['print', 'texture', 'distort', 'color', 'glow', 'film']
const ids = Object.keys(all)
  .filter(id => !positionals.length || positionals.includes(id.split('/')[1]) || positionals.includes(id))
  .sort((a, b) => ORDER.indexOf(all[a].category) - ORDER.indexOf(all[b].category) || a.localeCompare(b))
if (!ids.length) fail(`no filter called ${positionals.join(', ')}`)

const browser = await launchBrowser({ args: ['--allow-file-access-from-files'] })
const page = await browser.newPage({ width: 200, height: 200 })
const compositor = pathToFileURL(path.join(engine, 'emile', 'compose', 'compositor.js')).href
await page.goto(`${pathToFileURL(path.join(ROOT, 'scripts', 'review.html')).href}?compositor=${encodeURIComponent(compositor)}`)
await page.evaluate(`new Promise(r => { const c = () => window.ready ? r() : setTimeout(c, 20); c() })`)
const settings = {}
for (const s of values.set ?? []) {
  const m = /^([a-z0-9-]+)\.([a-z0-9_]+)=(.+)$/.exec(s)
  const id = m && Object.keys(all).find(id => id.split('/')[1] === m[1])
  const param = id && all[id].params.find(p => p.id === m[2])
  if (!param) fail(`--set ${s}: <filter>.<parameter>=<value>, a parameter of one of this repository's filters`)
  const value = param.type === 'float' || param.type === 'int' ? Number(m[3]) : param.type === 'bool' ? m[3] === 'true' : m[3]
  ;(settings[id] ??= {})[m[2]] = value
}
await page.evaluate(`Review.setup(${JSON.stringify(all)}, ${JSON.stringify(settings)})`)
const photos = []
for (const file of values.photo ?? []) {
  const name = path.basename(file, path.extname(file))
  await page.evaluate(`Review.loadFile(${JSON.stringify(name)}, ${JSON.stringify(pathToFileURL(path.resolve(file)).href)})`)
  photos.push(name)
}
const bases = ['studio', 'night', 'page', ...photos, 'graphic']
const save = (dataUrl, file) => fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'))

// What a measure must be, and the sentence when it isn't; then where the
// filter is weak
const fails = m => {
  const out = []
  if (m.amount0) out.push(`amount 0 changes ${m.amount0} bytes of the frame`)
  if (m.twice) out.push(`one frame drawn twice differs in ${m.twice} bytes`)
  if (!m.animated && m.motion > 0) out.push(`it isn't animated, yet frames differ (${m.motion.toFixed(3)})`)
  if (m.animated && m.motion === 0) out.push('it says it is animated, yet nothing moves')
  if (m.pumping > 0.006) out.push(`the frame's brightness wanders (${m.pumping.toFixed(4)})`)
  if (m.sizes > 4) out.push(`720p and 4K differ (${m.sizes.toFixed(1)} of 255)`)
  if (m.ms > 4) out.push(`a 1080p frame costs ${m.ms.toFixed(1)} ms`)
  return out
}

const weak = m => {
  const out = []
  for (const [b, t] of Object.entries(m.tone)) if (t.range < 0.7) out.push(`${b}: only ${t.range.toFixed(2)} of the picture's run from dark to light is left (${t.is.map(v => v.toFixed(2)).join('–')})`)
  for (const [b, k] of Object.entries(m.keeps)) if (k < 0.6) out.push(`${b}: the picture is hard to find in it (${k.toFixed(2)})`)
  return out
}

const report = []
try {
  for (const id of ids) {
    const name = id.split('/')[1]
    save(await page.evaluate(`Review.sheet(${JSON.stringify(id)}, ${JSON.stringify(bases)}, ${!!values.quick})`), path.join(out, `${name}.jpg`))
    if (values['no-measure']) { console.log(`${name}: ${path.join(out, `${name}.jpg`)}`); continue }
    const m = await page.evaluate(`Review.measure(${JSON.stringify(id)}, ${JSON.stringify({ animated: all[id].animated, bases })})`)
    m.fails = fails(m)
    m.weak = weak(m)
    report.push(m)
    const tone = Object.entries(m.tone).map(([b, t]) => `${b} ${t.is.map(v => v.toFixed(2)).join('–')}`).join(', ')
    const keeps = Object.entries(m.keeps).map(([b, k]) => `${b} ${k.toFixed(2)}`).join(', ')
    console.log(`${m.fails.length ? '✗' : '✓'} ${name} · ${m.ms.toFixed(2)} ms · motion ${m.motion.toFixed(2)} · pumping ${m.pumping.toFixed(4)} · sizes ${m.sizes.toFixed(1)} · spill ${(m.spill * 100).toFixed(1)}%\n    tone ${tone}\n    keeps ${keeps}`)
    for (const f of m.fails) console.log(`    ✗ ${f}`)
    for (const w of m.weak) console.log(`    △ ${w}`)
  }
  if (!values.quick) for (const b of bases.filter(b => b !== 'graphic')) save(await page.evaluate(`Review.gallery(${JSON.stringify(ids)}, ${JSON.stringify(b)})`), path.join(out, `gallery-${b}.jpg`))
  if (report.length) fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1) + '\n')
} finally {
  await browser.close()
}
console.log(`sheets in ${out}`)
