#!/usr/bin/env node
// Makes the sound packs (emile/<tag>-<nn>/, kind: sound; Émile's docs/TECH.md
// §12.1 乐器与音效) from the sounds chosen in scripts/sounds.json: each
// original fetched from its CC0 pack, levelled by loudness (LEVEL: its loudest
// 400 ms, or a bed's whole, so at gain 1 it sits right with music at -16
// LUFS; its peak never above -1 dBFS), written
// as sound.wav (48 kHz, 16-bit stereo), and pack.json with its tag, length,
// source and a line from what it measures (how long, how bright, whether
// it rises or falls), since that is what the AI chooses by; and its cut,
// the loudest 10 ms (where its hit is: the moment it is laid on); a bed
// of ambience starts where it is laid, its cut 0.
//
//   node scripts/sounds.mjs [name…]
//
// Needs ffmpeg (with aspectralstats).

import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const WORK = path.join(ROOT, '.sounds-work')
const FFMPEG = 'ffmpeg'
const { sounds } = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'sounds.json'), 'utf8'))
const only = new Set(process.argv.slice(2))

const NOUN = {
  click: ['click', '点击声'], pop: ['pop', '弹出声'], whoosh: ['swish', '扫过声'], rise: ['rising tone', '上升音'],
  drop: ['falling tone', '落下音'], impact: ['hit', '撞击声'], notify: ['chime', '提示音'], ambience: ['steady bed', '持续的底噪']
}
const TITLE = { click: ['Click', '点击'], pop: ['Pop', '弹出'], whoosh: ['Whoosh', '扫过'], rise: ['Rise', '上升'], drop: ['Drop', '落下'], impact: ['Impact', '撞击'], notify: ['Notify', '提示'], ambience: ['Ambience', '环境'] }

// Each source pack's zip, fetched and unpacked once
const unpacked = new Map()
async function source(zip) {
  if (!unpacked.has(zip)) {
    const dir = path.join(WORK, path.basename(zip, '.zip'))
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(WORK, { recursive: true })
      const file = path.join(WORK, path.basename(zip))
      const res = await fetch(zip)
      if (!res.ok) throw new Error(`${zip}: ${res.status}`)
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
      execFileSync('ditto', ['-x', '-k', file, dir])
    }
    unpacked.set(zip, dir)
  }
  return unpacked.get(zip)
}
const find = (dir, name) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { const f = find(p, name); if (f) return f } else if (e.name === name) return p
  }
  return null
}

// The loudness each kind is brought to: its loudest 400 ms (momentary),
// a bed's whole (integrated), LUFS
const LEVEL = { click: -22, pop: -22, notify: -20, whoosh: -20, rise: -20, drop: -20, impact: -16, ambience: -30 }
// What a meter reads of a file: its loudest 400 ms, its whole, its true peak
function meter(file) {
  const out = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'apad=pad_dur=0.5,ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const ms = [...out.matchAll(/ M:\s*(-?[\d.]+)/g)].map(m => Number(m[1])).filter(Number.isFinite)
  const summary = out.split('Summary:').at(-1)
  return { momentary: Math.max(...ms), whole: Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)[1]), peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)[1]) }
}

const seconds = file => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim())
// Its brightness over time: the spectral centroid of each frame (Hz)
function centroids(file) {
  const out = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'aspectralstats=measure=centroid,ametadata=print:file=-', '-f', 'null', '-'], { encoding: 'utf8' }).stdout
  return [...out.matchAll(/centroid=([\d.]+)/g)].map(m => Number(m[1])).filter(x => x > 0)
}

// The middle of its loudest 10 ms, in seconds: its hit
function loudest(file) {
  const out = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'asetnsamples=n=480:p=0,astats=metadata=1:reset=1:measure_overall=RMS_level:measure_perchannel=none,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-', '-f', 'null', '-'], { encoding: 'utf8' }).stdout
  const levels = [...out.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map(m => (m[1] === '-inf' ? -Infinity : Number(m[1])))
  const at = levels.indexOf(Math.max(...levels))
  return Math.round((at * 480 + 240) / 48000 * 1000) / 1000
}

// Which way its brightness moves; not said of a rise or a drop, whose tag
// says it (and whose brightness can move against its pitch)
function moveOf(tag, rises, falls) {
  if (tag === 'rise' || tag === 'drop') return ['', '']
  if (rises) return [', rising', '，往上走']
  if (falls) return [', falling', '，往下走']
  return ['', '']
}

for (const s of sounds) {
  if (only.size && !only.has(s.name)) continue
  const original = find(await source(s.zip), s.file)
  if (!original) throw new Error(`${s.name}: ${s.file} is not in ${s.zip}`)
  const dir = path.join(ROOT, 'emile', s.name)
  fs.mkdirSync(dir, { recursive: true })
  const wav = path.join(dir, 'sound.wav')
  const raw = path.join(WORK, `${s.name}.raw.wav`)
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', original, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_f32le', raw])
  const m = meter(raw)
  const now = s.tag === 'ambience' ? m.whole : m.momentary
  const gain = Math.min(LEVEL[s.tag] - now, -1 - m.peak)
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB`, '-sample_fmt', 's16', wav])
  fs.rmSync(raw)
  const secs = Math.round(seconds(wav) * 1000) / 1000
  const c = centroids(wav)
  const mean = c.reduce((a, b) => a + b, 0) / Math.max(1, c.length)
  const third = Math.max(1, Math.floor(c.length / 3))
  const avg = xs => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
  const [head, tail] = [avg(c.slice(0, third)), avg(c.slice(-third))]
  const length = secs < 0.4 ? ['short', '短促的'] : secs < 1.5 ? ['', ''] : ['long', '较长的']
  const tone = mean < 1500 ? ['dark', '低沉'] : mean < 4000 ? ['', ''] : ['bright', '明亮']
  // Which way it moves, unless its tag says so already
  const rises = c.length > 6 && tail > head * 1.3, falls = c.length > 6 && tail < head / 1.3
  const move = moveOf(s.tag, rises, falls)
  const [noun, nounZh] = NOUN[s.tag]
  const en = `A ${[length[0], tone[0], noun].filter(Boolean).join(' ')}${move[0]} (${secs.toFixed(2)} s), from ${s.from} (${s.file}).`.replace(/^A ([aeiou])/, 'An $1')
  const zh = `${length[1]}${tone[1] ? `${tone[1]}的` : ''}${nounZh}${move[1]}（${secs.toFixed(2)} 秒），来自 ${s.from}（${s.file}）。`
  const n = Number(s.name.split('-').pop())
  const pack = {
    id: `emile/${s.name}`, kind: 'sound', version: '1.2.1',
    title: { en: `${TITLE[s.tag][0]} ${n}`, 'zh-CN': `${TITLE[s.tag][1]} ${n}` }, description: { en, 'zh-CN': zh }, params: [],
    sound: { file: 'sound.wav', seconds: secs, cut: s.tag === 'ambience' ? 0 : Math.min(secs, loudest(wav)), tags: [s.tag] },
    sources: [{ name: s.from.replace(' · ', ', '), url: s.page, licence: 'CC0-1.0' }],
    licence: 'CC0-1.0', publisher: 'emile'
  }
  fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n')
  console.log(`${s.name}: ${en}`)
}
