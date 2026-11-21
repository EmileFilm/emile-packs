#!/usr/bin/env node
// Makes the sound packs (emile/<tag>-<nn>/, kind: sound; Émile's docs/TECH.md
// §12.1 乐器与音效) from the sounds chosen in scripts/sounds.json: each
// original fetched from its CC0 pack, levelled to a -1 dBFS peak, written
// as sound.wav (48 kHz, 16-bit stereo), and pack.json with its tag, length,
// source and a line from what it measures (how long, how bright, whether
// it rises or falls), since that is what the AI chooses by.
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

const stderr = (file, filter) => spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', filter, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const seconds = file => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim())
// Its brightness over time: the spectral centroid of each frame (Hz)
function centroids(file) {
  const out = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'aspectralstats=measure=centroid,ametadata=print:file=-', '-f', 'null', '-'], { encoding: 'utf8' }).stdout
  return [...out.matchAll(/centroid=([\d.]+)/g)].map(m => Number(m[1])).filter(x => x > 0)
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
  const peak = Number(/max_volume: (-?[\d.]+) dB/.exec(stderr(original, 'volumedetect'))[1])
  execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', original, '-af', `volume=${(-1 - peak).toFixed(2)}dB`, '-ar', '48000', '-ac', '2', '-sample_fmt', 's16', wav])
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
    id: `emile/${s.name}`, kind: 'sound', version: '1.0.0',
    title: { en: `${TITLE[s.tag][0]} ${n}`, 'zh-CN': `${TITLE[s.tag][1]} ${n}` }, description: { en, 'zh-CN': zh }, params: [],
    sound: { file: 'sound.wav', seconds: secs, tags: [s.tag] },
    sources: [{ name: s.from.replace(' · ', ', '), url: s.page, licence: 'CC0-1.0' }],
    licence: 'CC0-1.0', publisher: 'emile'
  }
  fs.writeFileSync(path.join(dir, 'pack.json'), JSON.stringify(pack, null, 2) + '\n')
  console.log(`${s.name}: ${en}`)
}
