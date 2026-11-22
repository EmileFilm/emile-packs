#!/usr/bin/env node
// Makes the instrument packs (emile/instruments/<name>/; Émile's
// docs/TECH.md §12.1 乐器与音效) from CC0 sample libraries pinned below:
// the chosen samples fetched, trimmed and levelled into samples/ as FLAC,
// the SFZ that maps them, pack.json (its gain measured, its sources),
// SKILL.md, and preview.m4a, a phrase played on it.
//
//   node scripts/instruments.mjs [name…] [--engine <Emile/engine>]
//
// samples/ is not committed: build.mjs publishes it as the version's asset
// (assets/<publisher>-<name>-<version>-samples.zip). Needs ffmpeg and the
// engine's sfizz_render (downloaded to ~/.emile/bin on first use).

import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const { values, positionals } = parseArgs({ options: { engine: { type: 'string' } }, allowPositionals: true })
const engine = path.resolve(values.engine ?? process.env.EMILE_ENGINE ?? path.join(ROOT, '..', 'Emile', 'engine'))
const { midiFile } = await import(pathToFileURL(path.join(engine, 'emile', 'sound', 'score', 'midi.mjs')).href)
const { getTool, binPath } = await import(pathToFileURL(path.join(engine, 'lib', 'tools.mjs')).href)
await getTool('sfizz', () => {})
const SFIZZ = binPath('sfizz', 'sfizz_render')
const FFMPEG = 'ffmpeg'

// The libraries, each at a commit: every sample is fetched from there
const LIBS = {
  vcsl: { repo: 'sgossner/VCSL', commit: 'c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e', name: 'Versilian Community Sample Library (VCSL)', licence: 'CC0-1.0' },
  vsco: { repo: 'sgossner/VSCO-2-CE', commit: '440300901dfe9275fd84e0b7763af1f8443ae62e', name: 'Versilian Studios Chamber Orchestra 2, Community Edition', licence: 'CC0-1.0' },
  vd: { repo: 'sfzinstruments/virtuosity_drums', commit: '9f04cf9a734527edfbb0a4eee1f674e45bbf71bc', name: 'Virtuosity Drums, by Versilian Studios and Karoryfer Samples', licence: 'CC0-1.0' }
}
const words = (en, zh) => ({ en, 'zh-CN': zh })

// Each instrument: which samples (folder, a pattern picking the files, its
// velocity layers by a part of the name), how long a sample is kept, its
// release; shift: semitones from the note a file is named to the note it
// sounds (measured: VCSL and VSCO name middle C C3). A kit: its pieces by key.
const INSTRUMENTS = {
  piano: {
    lib: 'vcsl', dirs: ['Grand Piano, Kawai/'], pick: /GPiano_sus_.*_v(2|4)_rr1/, layers: { _v2_: [1, 80], _v4_: [81, 127] }, shift: 12, keep: 7, release: 0.8,
    family: 'keys', reverb: 0.25, phrase: 'piano',
    title: words('Grand piano', '三角钢琴'), description: words('A Kawai grand, close and warm: soft notes stay round, hard ones ring.', '一台 Kawai 三角钢琴，近而暖：轻的音圆润，重的音明亮。'),
    sounds: 'A Kawai grand piano recorded close: warm and round when played softly, brighter and ringing when hit hard (two layers, the change at velocity 0.63).',
    suits: 'Ostinatos and arpeggios under a calm or thoughtful film, a melody on top, chords that change on the cuts, single notes over a quiet moment.',
    notSuits: 'Fast dense runs in the low octaves (they muddy), a driving beat by itself.'
  },
  strings: {
    lib: 'vsco', dirs: ['Strings/Violin Section/susVib/', 'Strings/Viola Section/susvib/', 'Strings/Cello Section/susvib/'], pick: /_v1[_.]/, layers: { '': [1, 127] }, shift: 12, keep: 8, release: 0.6, attack: 0.25,
    family: 'strings', reverb: 0.45, phrase: 'pad',
    title: words('String section', '弦乐组'), description: words('Violins, violas and cellos holding long notes, soft and swelling.', '小提琴、中提琴、大提琴拉长音，柔和、会慢慢涨起来。'),
    sounds: 'Violin, viola and cello sections bowing long notes with vibrato, recorded soft: a quarter-second swell in, then a held tone. Cellos below C3, violas to about A4, violins above.',
    suits: 'A pad under the whole film, chords held across a cut, a slow line that swells into a reveal, a held high note over a quiet or black moment.',
    notSuits: 'Short rhythmic notes (use strings-spiccato), anything faster than about two notes a second.'
  },
  'strings-spiccato': {
    lib: 'vsco', dirs: ['Strings/Violin Section/Spic/', 'Strings/Cello Section/spic/'], pick: /_v1_(rr|RR)1/, layers: { '': [1, 127] }, shift: 12, keep: 1.5, release: 0.15,
    family: 'strings', reverb: 0.3, phrase: 'pulse',
    title: words('Strings, short', '弦乐跳弓'), description: words('Violins and cellos bouncing short notes: a pulse that drives forward.', '小提琴与大提琴的短促跳弓：往前推的律动。'),
    sounds: 'Violin and cello sections playing short bounced notes (spiccato): a dry, quick pulse.',
    suits: 'An eighth-note pulse under a product shown in motion, building tension before a reveal, doubling a bass line an octave up.',
    notSuits: 'Held notes (use strings), slow quiet passages.'
  },
  'contrabass-pizz': {
    lib: 'vsco', dirs: ['Strings/Solo Contrabass/Pizz/'], pick: /_v(1|3)_rr1/, layers: { _v1_: [1, 80], _v3_: [81, 127] }, shift: 12, keep: 3, release: 0.3,
    family: 'bass', reverb: 0.15, phrase: 'bass',
    title: words('Double bass, plucked', '低音提琴拨弦'), description: words('A double bass plucked: round low notes that walk under the music.', '拨弦的低音提琴：圆厚的低音，在音乐底下走。'),
    sounds: 'A solo double bass plucked with the finger: a round low note that fades within a second or two.',
    suits: 'The bass under piano or strings, a walking line, roots on the beat in a light groove.',
    notSuits: 'Long sustained bass (use strings, cellos), anything above E3.'
  },
  harp: {
    lib: 'vcsl', dirs: ['/Concert Harp/'], pick: /_(mf|f)1\.wav$/, layers: { _mf1: [1, 90], _f1: [91, 127] }, shift: 0, keep: 5, release: 1.0,
    family: 'plucked', reverb: 0.4, phrase: 'arp',
    title: words('Concert harp', '竖琴'), description: words('A concert harp: bright plucked notes that ring and shimmer.', '音乐会竖琴：明亮的拨弦，余音闪闪发光。'),
    sounds: 'A concert harp plucked: bright attack, notes ring several seconds.',
    suits: 'Arpeggios that open a film or a section, a glissando into a reveal, a gentle, elegant mood.',
    notSuits: 'A driving rhythm, a dark or tense film.'
  },
  vibraphone: {
    lib: 'vcsl', dirs: ['/Vibraphone/'], pick: /Vibes_(soft|hard)_.*rr1/, layers: { _soft_: [1, 90], _hard_: [91, 127] }, shift: 12, keep: 5, release: 1.2,
    family: 'mallets', reverb: 0.35, phrase: 'arp',
    title: words('Vibraphone', '颤音琴'), description: words('A vibraphone: soft metal bars, clean and modern.', '颤音琴：柔和的金属音条，干净、现代。'),
    sounds: 'A vibraphone struck with soft or hard mallets: a clean, bell-like tone that rings.',
    suits: 'A light, clean tech or product film, a repeating figure over a pad, small accents on the cuts.',
    notSuits: 'Low notes (it starts at F3), a heavy or epic mood.'
  },
  glockenspiel: {
    lib: 'vcsl', dirs: ['/Glockenspiel/'], pick: /glock_loud_.*_01/, layers: { '': [1, 127] }, shift: 12, keep: 3, release: 1.0,
    family: 'mallets', reverb: 0.35, phrase: 'bell',
    title: words('Glockenspiel', '钟琴'), description: words('A glockenspiel: tiny bright bells that sparkle on top.', '钟琴：小小的、明亮的铃声，在最上面闪光。'),
    sounds: 'A glockenspiel: very high, bright, short bell notes.',
    suits: 'A sparkle on a reveal or a logo, doubling a melody two octaves up, a playful or magical moment.',
    notSuits: 'More than a few notes at a time, anything under G5.'
  },
  drums: {
    lib: 'vd', family: 'drums', reverb: 0.1, phrase: 'groove',
    kit: [['kick', /Samples\/mid\/kick\/mid_kick_snoff_vl3_rr1/, 36], ['snare', /Samples\/mid\/snare\/mid_snare_center_vl24\./, 38],
      ['closed hi-hat', /Samples\/mid\/hh\/mid_hh_closed_vl3_rr1/, 42], ['open hi-hat', /Samples\/mid\/hh\/mid_hh_open_vl3_rr1/, 46], ['crash', /Samples\/mid\/crash\/mid_crash_crash_vl2_rr1/, 49]],
    title: words('Drum kit', '架子鼓'), description: words('An acoustic drum kit: kick, snare, hi-hats and a crash.', '一套原声架子鼓：底鼓、军鼓、踩镲与吊镲。'),
    sounds: 'An acoustic drum kit recorded from a middle distance: a full kick, a crisp snare, closed and open hi-hats, a crash.',
    suits: 'A groove from the point a film picks up, a crash on a big cut, a fill into a reveal.',
    notSuits: 'A quiet or reflective film, electronic styles (use the generated music for those).'
  },
  'cinematic-perc': {
    lib: 'vcsl', family: 'percussion', reverb: 0.4, phrase: 'impact',
    kit: [['bass drum', /\/Bass Drum 2\/bassdrum_hit_ff\./, 35], ['timpani', /\/Timpani 1\/Hit\/Timpani1_Hit_v4_rr1/, 36],
      ['cymbal swell (2 s)', /\/Suspended Cymbal 1\/susCymb1_cresc_2s\./, 55], ['bowed cymbal', /\/Suspended Cymbal 1\/susCymb1_bow_13\./, 57]],
    title: words('Cinematic percussion', '电影打击乐'), description: words('A big bass drum, a timpani hit and cymbal swells: weight on the cuts.', '大鼓、定音鼓与吊镲渐强：给切点加分量。'),
    sounds: 'A concert bass drum hit hard, a timpani hit, a suspended cymbal swelling over two seconds, a bowed cymbal shimmer.',
    suits: 'A hit on a big cut or a title landing, a swell that ends exactly on a reveal (start it two seconds before), weight at the end of a film.',
    notSuits: 'A steady beat, more than a hit every few seconds.'
  }
}

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString()
const trees = {}
async function tree(lib) {
  if (!trees[lib]) {
    const { repo, commit } = LIBS[lib]
    const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/${commit}?recursive=1`, { headers: { 'user-agent': 'emile-packs' } })
    if (!res.ok) throw new Error(`${repo}: the file list could not be read (${res.status})`)
    trees[lib] = (await res.json()).tree.filter(e => e.type === 'blob').map(e => e.path)
  }
  return trees[lib]
}
async function fetchFile(lib, file, to) {
  if (fs.existsSync(to)) return
  const { repo, commit } = LIBS[lib]
  const res = await fetch(`https://raw.githubusercontent.com/${repo}/${commit}/${file.split('/').map(encodeURIComponent).join('/')}`)
  if (!res.ok) throw new Error(`${repo} ${file}: ${res.status}`)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()))
}

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const noteOf = name => {
  const m = /(?<![A-Za-z])([A-G])(#|b)?(-?\d)(?=[_v.]|$)/.exec(name)
  return m ? (Number(m[3]) + 1) * 12 + PC[m[1]] + ({ '#': 1, b: -1 }[m[2]] ?? 0) : null
}
const flacName = file => `${path.basename(file).replace(/\.(wav|flac)$/i, '').toLowerCase().replace(/[^a-z0-9#._-]+/g, '-').replace(/#/g, 's')}.flac`
// Kept up to keep s, faded over its last 0.3 s; 48 kHz, 16-bit FLAC
const trim = (src, dst, keep) => sh(FFMPEG, ['-v', 'error', '-y', '-i', src, '-t', String(keep), '-af', `afade=t=out:st=${Math.max(0, keep - 0.3)}:d=0.3`, '-ar', '48000', '-sample_fmt', 's16', dst])
// What ffmpeg measures, said on its stderr
const measure = (file, filter) => spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', filter, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const peakDb = file => Number(/max_volume: (-?[\d.]+) dB/.exec(measure(file, 'volumedetect'))[1])
const loudness = file => Number(/Input Integrated:\s+(-?[\d.]+)/.exec(measure(file, 'loudnorm=print_format=summary'))[1])

// One gain for all of an instrument's samples: its loudest peak to -1 dBFS
// (each layer keeps how much louder it is than the next)
function level(dir) {
  const files = fs.readdirSync(dir).map(f => path.join(dir, f))
  const gain = -1 - Math.max(...files.map(peakDb))
  if (Math.abs(gain) < 0.1) return
  for (const f of files) {
    const tmp = `${f}.tmp.flac`
    sh(FFMPEG, ['-v', 'error', '-y', '-i', f, '-af', `volume=${gain.toFixed(2)}dB`, '-sample_fmt', 's16', tmp])
    fs.renameSync(tmp, f)
  }
}

// A phrase at 90 BPM, a mezzo-forte one (velocity 0.6), fitted to the range
function phrase(kind, [lo, hi]) {
  const fit = p => { while (p < lo) p += 12; while (p > hi) p -= 12; return p }
  const am = [57, 60, 64, 71], f = [53, 57, 60, 67], c = [48, 55, 64, 72], g = [55, 59, 62, 67]
  const out = []
  const bars = [am, f, c, g]
  if (kind === 'piano') bars.forEach((ch, b) => { out.push([fit(ch[0] - 24), b * 4, 4, 0.6]); [0, 1, 2, 3, 1, 2, 3, 1].forEach((s, i) => out.push([fit(ch[s]), b * 4 + i * 0.5, 0.9, 0.6])) })
  if (kind === 'pad') bars.forEach((ch, b) => [ch[0] - 12, ch[1], ch[2], ch[3] + 12].forEach(p => out.push([fit(p), b * 4, 4, 0.6])))
  if (kind === 'pulse') bars.forEach((ch, b) => { for (let i = 0; i < 8; i++) { out.push([fit(ch[0] - 12), b * 4 + i * 0.5, 0.4, 0.6]); if (i % 2 === 0) out.push([fit(ch[2] + 12), b * 4 + i * 0.5, 0.4, 0.6]) } })
  if (kind === 'bass') bars.forEach((ch, b) => [0, 0, 7, 0].forEach((s, i) => out.push([fit(ch[0] - 24 + s), b * 4 + i, 0.9, 0.6])))
  if (kind === 'arp') bars.forEach((ch, b) => [0, 1, 2, 3, 2, 3, 1, 2].forEach((s, i) => out.push([fit(ch[s] + 12), b * 4 + i * 0.5, 1.5, 0.6])))
  if (kind === 'bell') [76, 79, 84, 83, 79, 76, 74, 72].forEach((p, i) => out.push([fit(p), i * 2, 1.5, 0.6]))
  if (kind === 'groove') for (let bar = 0; bar < 4; bar++) for (let i = 0; i < 8; i++) {
    const t = bar * 4 + i * 0.5
    out.push([42, t, 0.25, 0.6])
    if ([0, 3, 5].includes(i)) out.push([36, t, 0.5, 0.6])
    if ([2, 6].includes(i)) out.push([38, t, 0.5, 0.6])
    if (bar === 0 && i === 0) out.push([49, 0, 2, 0.6])
  }
  if (kind === 'impact') out.push([55, 0, 2, 0.6], [35, 2, 2, 0.6], [36, 2, 2, 0.6], [57, 4, 4, 0.6], [36, 8, 1, 0.6], [36, 9, 1, 0.6], [36, 10, 1, 0.6], [55, 11, 2, 0.6], [35, 13, 2, 0.6], [36, 13, 2, 0.6])
  return out.map(([pitch, at, beats, velocity]) => ({ pitch, at, beats, velocity }))
}

const skillText = (name, d, range, keys) => `# ${d.title.en}

${d.sounds}

## Range

${keys ? `A kit: one sound per key.\n\n${Object.entries(keys).map(([k, v]) => `- ${k}: ${v}`).join('\n')}` : `MIDI ${range[0]}–${range[1]}. Notes outside it are refused.`}

## Suits

${d.suits}

## Doesn't suit

${d.notSuits}

## Playing it

Velocity 0–1 sets how hard a note is played${d.layers && Object.keys(d.layers).length > 1 ? ', and above about 0.63 a brighter recording takes over' : ''}. In a score, \`instrument: '${name}'\`.
`

const tmpRoot = path.join(ROOT, '.instruments-work')
const names = positionals.length ? positionals : Object.keys(INSTRUMENTS)
for (const name of names) {
  const d = INSTRUMENTS[name]
  if (!d) throw new Error(`no instrument ${name} (${Object.keys(INSTRUMENTS).join(', ')})`)
  const dir = path.join(ROOT, 'emile', 'instruments', name)
  const samples = path.join(dir, 'samples')
  fs.rmSync(samples, { recursive: true, force: true })
  fs.mkdirSync(samples, { recursive: true })
  const raw = path.join(tmpRoot, name)
  const files = await tree(d.lib)
  const lines = [`// ${d.title.en}: made by scripts/instruments.mjs from ${LIBS[d.lib].name}`, '<control> default_path=samples/']
  let range, keys = null
  if (d.kit) {
    lines.push('<global> ampeg_release=0.5 loop_mode=one_shot')
    keys = {}
    for (const [piece, pattern, key] of d.kit) {
      const file = files.find(f => pattern.test(f))
      if (!file) throw new Error(`${name}: no sample for ${piece}`)
      const src = path.join(raw, path.basename(file))
      await fetchFile(d.lib, file, src)
      const out = flacName(file)
      trim(src, path.join(samples, out), 6)
      lines.push(`<region> sample=${out} key=${key}`)
      keys[key] = piece
    }
    const k = Object.keys(keys).map(Number)
    range = [Math.min(...k), Math.max(...k)]
  } else {
    lines.push(`<global> ampeg_release=${d.release}${d.attack ? ` ampeg_attack=${d.attack}` : ''}`)
    const picked = files.filter(f => d.dirs.some(x => f.includes(x)) && d.pick.test(f))
    const regions = new Map()
    for (const file of picked) {
      const note = noteOf(path.basename(file))
      const layer = Object.entries(d.layers).find(([part]) => path.basename(file).includes(part))
      if (note == null || !layer) continue
      const src = path.join(raw, path.basename(file))
      await fetchFile(d.lib, file, src)
      const out = flacName(file)
      trim(src, path.join(samples, out), d.keep)
      const key = layer[1].join('-')
      if (!regions.has(key)) regions.set(key, new Map())
      regions.get(key).set(note + d.shift, out)
    }
    const all = []
    for (const [vel, byNote] of [...regions].sort()) {
      const [lovel, hivel] = vel.split('-')
      const roots = [...byNote.keys()].sort((a, b) => a - b)
      roots.forEach((r, i) => {
        const lo = i === 0 ? 0 : Math.floor((roots[i - 1] + r) / 2) + 1
        const hi = i === roots.length - 1 ? 127 : Math.floor((r + roots[i + 1]) / 2)
        lines.push(`<region> sample=${byNote.get(r)} pitch_keycenter=${r} lokey=${lo} hikey=${hi} lovel=${lovel} hivel=${hivel}`)
      })
      all.push(...roots)
    }
    range = [Math.min(...all), Math.max(...all)]
  }
  level(samples)
  fs.writeFileSync(path.join(dir, 'instrument.sfz'), lines.join('\n') + '\n')

  // Its gain: the dB that brings its phrase at mezzo-forte to -38 LUFS as
  // sfizz plays it (sfizz leaves about 12 dB of headroom; the mix is
  // brought to the music's loudness after): what balances instruments
  const work = path.join(tmpRoot, `${name}-preview`)
  fs.mkdirSync(work, { recursive: true })
  fs.writeFileSync(path.join(work, 'phrase.mid'), midiFile(phrase(d.phrase, range), 90))
  sh(SFIZZ, ['--sfz', path.join(dir, 'instrument.sfz'), '--midi', path.join(work, 'phrase.mid'), '--wav', path.join(work, 'phrase.wav'), '--samplerate', '48000'])
  const gain = Math.round(Math.max(-24, Math.min(24, -38 - loudness(path.join(work, 'phrase.wav')))) * 10) / 10
  sh(FFMPEG, ['-v', 'error', '-y', '-i', path.join(work, 'phrase.wav'), '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11,aresample=48000', '-c:a', 'aac', '-b:a', '160k', path.join(dir, 'preview.m4a')])

  const lib = LIBS[d.lib]
  const pack = {
    id: `emile/${name}`, kind: 'instrument', version: '1.0.0', title: d.title, description: d.description, params: [],
    instrument: { sfz: 'instrument.sfz', range, gain, reverb: d.reverb, family: d.family, ...(keys ? { keys } : {}) },
    sources: [{ name: lib.name, url: `https://github.com/${lib.repo}/tree/${lib.commit}`, licence: lib.licence }],
    licence: lib.licence, publisher: 'emile'
  }
  fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n')
  fs.writeFileSync(path.join(dir, 'SKILL.md'), skillText(name, d, range, keys))
  const mb = fs.readdirSync(samples).reduce((n, f) => n + fs.statSync(path.join(samples, f)).size, 0) / 1e6
  console.log(`${name}: ${fs.readdirSync(samples).length} samples, ${mb.toFixed(1)} MB, range ${range.join('–')}, gain ${gain} dB`)
}
// The fetched originals stay in .instruments-work/ (not committed) for the next run
