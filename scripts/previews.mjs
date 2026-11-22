#!/usr/bin/env node
// The previews in Émile's Inspirations: preview.mp4 (4 s, silent, a loop,
// 854 × 480, H.264, a few hundred KB) and preview.jpg (a settled frame)
// beside each pack, drawn by Émile's own compositor, so a preview looks as
// the product draws it: a filter over the footage scripts/footage.json
// records, a transition between two plain cards, A and B.
// The build (build.mjs) lists them in index.json apart from the pack's
// files; it never draws them, so a second build changes nothing.
//
//   node scripts/previews.mjs [--footage <folder>] [name…] [--all] [--engine <Emile/engine>]
//       the packs without a preview, or those named, or --all (a filter:
//       wiped in from the left over the footage's clip a, held, wiped back;
//       a transition: once from card A, a solid colour with a big A, into
//       card B). The footage (needed for a filter) is read from <folder> (downloaded there first
//       when it isn't, its SHA-256 checked); never put into this repository
//
//   node scripts/previews.mjs --skill <name> --footage <folder> --out <folder outside this repository> [--model <id>]
//       a candidate preview for an official Skill that changes the picture (kind: look): Émile's agent makes a
//       short film over clip a with the Skill brought in, and its preview
//       is encoded into --out. Nothing is written here: look at it, and
//       copy preview.mp4 and preview.jpg into its folder in guides/ by hand
//
//   node scripts/previews.mjs --subtitle <name|all> [--engine <Emile/engine>]
//       a subtitle style's preview (guides/subtitles/subtitle-<name>/), drawn as Émile
//       makes it, no AI: the engine's subtitle command lays the style over
//       black (type is previewed on black, as a transition between plain
//       cards) with SUBTITLE_TEXT timed at a reading speed, the film is
//       exported, and preview.mp4 and preview.jpg are written beside the
//       Skill (all: every subtitle style). The Skill is lent to the engine as
//       one of a person's own (a copy), in a home of its own for the run (the
//       rest of ~/.emile linked in), so it is drawn before the index lists it

import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import { guideFolders, packFolders } from './skills.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    footage: { type: 'string' },
    all: { type: 'boolean' },
    skill: { type: 'string' },
    subtitle: { type: 'string' },
    out: { type: 'string' },
    model: { type: 'string' },
    engine: { type: 'string' }
  }
})
const fail = message => {
  console.error(`previews: ${message}`)
  process.exit(1)
}

const engine = path.resolve(values.engine ?? process.env.EMILE_ENGINE ?? path.join(ROOT, '..', 'Emile', 'engine'))
if (!fs.existsSync(path.join(engine, 'emile', 'library', 'previews.mjs'))) fail(`no engine at ${engine} (--engine or EMILE_ENGINE: the Émile repository's engine/)`)
const lib = f => import(pathToFileURL(path.join(engine, f)).href)
const { encodePreview, PREVIEW, PREVIEW_SIZE } = await lib('emile/library/previews.mjs')
const { download } = await lib('lib/fetch.mjs')
const { ffmpegPath, getTool } = await lib('lib/tools.mjs')

// The footage, each clip downloaded into --footage when it isn't there
// and checked against its SHA-256
const FOOTAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'footage.json'), 'utf8'))
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
async function clip(name) {
  if (!values.footage) fail('--footage <folder>: where the footage of scripts/footage.json is kept (outside this repository)')
  const c = FOOTAGE.clips[name]
  const file = path.join(path.resolve(values.footage), c.file)
  if (!fs.existsSync(file)) {
    console.log(`downloading ${c.page} into ${file}`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    await download(c.download, file, c.sha256)
  }
  if (sha256(file) !== c.sha256) fail(`${file} isn't the clip footage.json records (its SHA-256 differs): download ${c.page} again`)
  return { ...c, path: file }
}

// A clip's piece as frames at the preview's size, 24 fps, cropped to fill
async function framesOf(c, dir) {
  await getTool('ffmpeg')
  const { width, height, fps } = PREVIEW_SIZE
  fs.mkdirSync(dir, { recursive: true })
  execFileSync(ffmpegPath(), ['-v', 'error', '-y', '-ss', String(c.from), '-t', String(c.seconds), '-i', c.path, '-an',
    '-vf', `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${width}:${height},fps=${fps}`, '-q:v', '2', '-start_number', '0', path.join(dir, '%04d.jpg')])
  return fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort().map(f => pathToFileURL(path.join(dir, f)).href)
}

// The words every subtitle style's preview says (a keyword marked), and
// the second its still is taken at: a chunk on screen, a word being said
const SUBTITLE_TEXT = 'Every [[great story]] starts with one frame.'
const SUBTITLE_STILL = 0.95
// The part of the frame a subtitle preview keeps: [x, y, w, h], shares
const SUBTITLE_CROP = [0.25, 0.5, 0.5, 0.5]

// Every pack folder of this repository
const packDirs = packFolders(ROOT)

if (values.skill) await skillCandidate(values.skill)
else if (values.subtitle) await subtitlePreviews(values.subtitle)
else await packPreviews()

async function packPreviews() {
  const all = {}
  for (const dir of packDirs) {
    const pack = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8'))
    if (pack.kind === 'look') continue
    const read = f => fs.readFileSync(path.join(dir, f), 'utf8')
    all[pack.id] = { dir, kind: pack.kind, params: pack.params, glsl: read(pack.backends.glsl), passes: (pack.passes ?? []).map(p => ({ id: p.id, scale: p.scale, glsl: read(p.glsl) })) }
  }
  const has = dir => fs.existsSync(path.join(dir, PREVIEW.video)) && fs.existsSync(path.join(dir, PREVIEW.still))
  const ids = Object.keys(all).filter(id => positionals.length ? positionals.includes(id) || positionals.includes(id.split('/')[1]) : values.all || !has(all[id].dir))
  if (positionals.length && ids.length !== positionals.length) fail(`not a pack here: ${positionals.filter(n => !ids.some(id => id === n || id.split('/')[1] === n)).join(', ')}`)
  if (!ids.length) return console.log('every pack has its preview (name packs, or --all, to draw them again)')

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emile-previews-'))
  const { launchBrowser } = await lib('lib/chrome.mjs')
  const browser = await launchBrowser({ args: ['--allow-file-access-from-files'] })
  try {
    // The footage only when a filter is drawn: a transition goes between cards
    const a = ids.some(id => all[id].kind !== 'transition') ? await framesOf(await clip('a'), path.join(tmp, 'a')) : []
    const page = await browser.newPage({ width: 200, height: 200 })
    const compositor = pathToFileURL(path.join(engine, 'core', 'compose', 'compositor.js')).href
    await page.goto(`${pathToFileURL(path.join(ROOT, 'scripts', 'previews.html')).href}?compositor=${encodeURIComponent(compositor)}`)
    await page.evaluate(`new Promise(r => { const c = () => window.ready ? r() : setTimeout(c, 20); c() })`)
    const packs = Object.fromEntries(Object.entries(all).map(([id, p]) => [id, { id, kind: p.kind, params: p.params, glsl: p.glsl, passes: p.passes }]))
    await page.evaluate(`Preview.setup(${JSON.stringify(packs)}, ${JSON.stringify(a)})`)
    const n = await page.evaluate('Preview.N')
    for (const id of ids) {
      const frames = path.join(tmp, 'out', id.replace('/', '_'))
      fs.mkdirSync(frames, { recursive: true })
      for (let i = 0; i < n; i++) {
        const url = await page.evaluate(`Preview.frame(${JSON.stringify(id)}, ${i})`)
        fs.writeFileSync(path.join(frames, `${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'))
      }
      // The still: a filter held whole (frame 54), a transition halfway (frame 42)
      const still = (all[id].kind === 'transition' ? 42 : 54) / PREVIEW_SIZE.fps
      const made = await encodePreview({ input: path.join(frames, '%04d.jpg'), frames: true, seconds: n / PREVIEW_SIZE.fps, still, dir: all[id].dir })
      console.log(`✓ ${id} · ${(made.video.bytes / 1024).toFixed(0)} KB video · ${(made.still.bytes / 1024).toFixed(0)} KB still`)
    }
  } finally {
    await browser.close()
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

// A candidate for an official Skill's preview: a short film made with it
// by Émile's agent, over clip a. Uses the AI the engine's agent is set up
// with (the model --model, else the agent's own choice)
async function skillCandidate(name) {
  if (!values.out) fail('--out <folder>: where the candidate goes (outside this repository; you look at it, then copy it in)')
  const out = path.resolve(values.out)
  if (!path.relative(ROOT, out).startsWith('..')) fail('--out is inside this repository: a candidate is looked at before it goes in')
  const guide = guideFolders(ROOT).find(g => g.name === name)
  if (!guide) fail(`no guide ${name} in guides/`)
  const skillDir = path.join(ROOT, guide.folder)
  if (!/^---\r?\n[\s\S]*?^kind:\s*look\s*$[\s\S]*?\r?\n---/m.test(fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8'))) fail(`${guide.folder} doesn't change the picture (its SKILL.md has no kind: look): a function Skill has no preview`)
  const emile = path.join(engine, 'emile', 'cli.mjs')
  const agent = path.join(engine, '..', 'agent', 'src', 'main.ts')
  const a = await clip('a')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emile-skill-candidate-'))
  const project = path.join(tmp, 'film')
  const env = { ...process.env, EMILE_PACKS: process.env.EMILE_PACKS ?? ROOT }
  const json = (bin, args, input) => {
    const lines = execFileSync(process.execPath, [bin, ...args, '--json'], { env, input, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['pipe', 'pipe', 'inherit'] }).trim().split('\n')
    return lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean).find(e => e.type === 'result')?.value
  }
  try {
    // The footage's piece, the film's one video clip
    await getTool('ffmpeg')
    fs.mkdirSync(path.join(tmp, 'piece'))
    const piece = path.join(tmp, 'piece', 'shot.mp4')
    execFileSync(ffmpegPath(), ['-v', 'error', '-y', '-ss', String(a.from), '-t', '4', '-i', a.path, '-an', '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080', '-c:v', 'libx264', '-crf', '18', piece])
    json(emile, ['new', project, '--aspect', '16:9', '--title', 'Preview', '--idea', `A four-second shot showing what the Skill ${name} is for`])
    json(emile, ['materials-add', project, piece])
    const { num, den } = JSON.parse(fs.readFileSync(path.join(project, 'emile.json'), 'utf8')).project.fps
    const shot = { id: 'shot', type: 'video', name: 'Shot', frames: [0, Math.round(4 * num / den)], track: 1, video: { file: 'assets/shot.mp4', in: 0, audio: 'mute' } }
    json(emile, ['film-set', project], JSON.stringify([{ op: 'add', path: '/timeline/clips/-', value: shot }]))
    console.log(`asking Émile's agent to use ${name} on the shot (this uses the AI)…`)
    json(agent, ['chat', project, '--request', `Use the Skill ${name} for this one shot: do what it is for, the way it says, over the whole shot.`, '--ref', `skill:${name}`, ...(values.model ? ['--model', values.model] : [])])
    const film = path.join(tmp, 'film.mp4')
    json(emile, ['export', project, '--to', film, '--aspect', '16:9'])
    const made = await encodePreview({ input: film, seconds: 4, still: 2, dir: out })
    console.log(`candidate for ${guide.folder}/:\n  ${made.video.path} (${(made.video.bytes / 1024).toFixed(0)} KB)\n  ${made.still.path} (${(made.still.bytes / 1024).toFixed(0)} KB)\nthe film's timeline: ${path.join(project, 'emile.json')}`)
  } catch (e) {
    fail(`${e.message}\nthe project is left in ${project}`)
  }
}

async function subtitlePreviews(which) {
  const names = which === 'all'
    ? fs.readdirSync(path.join(ROOT, 'guides', 'subtitles')).filter(n => n.startsWith('subtitle-')).map(n => n.slice('subtitle-'.length)).sort()
    : which.split(',').map(n => n.trim())
  for (const n of names) if (!fs.existsSync(path.join(ROOT, 'guides', 'subtitles', `subtitle-${n}`, 'SKILL.md'))) fail(`no subtitle style guides/subtitles/subtitle-${n}/`)
  const emile = path.join(engine, 'emile', 'cli.mjs')
  const { ROOTS } = await lib('lib/paths.mjs')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'emile-subtitle-previews-'))
  // A home for the run: the real one's folders linked, skills/ its own
  const home = path.join(tmp, 'home')
  fs.mkdirSync(path.join(home, 'skills'), { recursive: true })
  if (fs.existsSync(ROOTS.emile)) for (const f of fs.readdirSync(ROOTS.emile)) if (f !== 'skills') fs.symlinkSync(path.join(ROOTS.emile, f), path.join(home, f))
  const env = { ...process.env, EMILE_HOME: home }
  const json = args => {
    const lines = execFileSync(process.execPath, [emile, ...args, '--json'], { env, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['pipe', 'pipe', 'inherit'] }).trim().split('\n')
    return lines.map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean).find(e => e.type === 'result')?.value
  }
  try {
    await getTool('ffmpeg')
    const piece = path.join(tmp, 'shot.mp4')
    // The ground: four seconds of black
    execFileSync(ffmpegPath(), ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=1920x1080:r=30:d=4', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', piece])
    for (const n of names) {
      const skill = path.join(ROOT, 'guides', 'subtitles', `subtitle-${n}`)
      // A copy: a person's Skills are read as folders, a link is not one
      fs.cpSync(skill, path.join(home, 'skills', `subtitle-${n}`), { recursive: true, filter: f => !/preview\.(mp4|jpg)$/.test(f) })
      const project = path.join(tmp, n)
      json(['new', project, '--aspect', '16:9', '--title', `Subtitles ${n}`, '--idea', 'A subtitle style on black'])
      json(['materials-add', project, piece])
      const { num, den } = JSON.parse(fs.readFileSync(path.join(project, 'emile.json'), 'utf8')).project.fps
      const shot = { id: 'shot', type: 'video', name: 'Black', frames: [0, Math.round(4 * num / den)], track: 1, video: { file: 'assets/shot.mp4', in: 0, audio: 'mute' } }
      execFileSync(process.execPath, [emile, 'film-set', project, '--json'], { env, input: JSON.stringify([{ op: 'add', path: '/timeline/clips/-', value: shot }]), stdio: ['pipe', 'ignore', 'inherit'] })
      json(['subtitle', project, '--style', n, '--text', SUBTITLE_TEXT, '--at', '0.3'])
      const film = path.join(tmp, `${n}.mp4`)
      json(['export', project, '--to', film, '--aspect', '16:9'])
      // The words made larger: the middle of the frame's lower half, where
      // the subtitle band is (2×); a style that fills the frame (area:
      // frame) whole
      const whole = /^area:\s*frame\s*$/m.test(fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8'))
      const made = await encodePreview({ input: film, seconds: 4, still: SUBTITLE_STILL, dir: skill, crop: whole ? null : SUBTITLE_CROP })
      console.log(`✓ subtitle-${n} · ${(made.video.bytes / 1024).toFixed(0)} KB video · ${(made.still.bytes / 1024).toFixed(0)} KB still`)
    }
  } catch (e) {
    fail(`${e.message}\nthe projects are left in ${tmp}`)
  }
  fs.rmSync(tmp, { recursive: true, force: true })
}
