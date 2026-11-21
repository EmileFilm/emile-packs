#!/usr/bin/env node
// Uploads to the release `assets` every archive in assets/ it hasn't got:
// the packs' recordings (an instrument's samples, a sound's WAV) and
// skills/emile-sounds as one download, all made by scripts/build.mjs. A
// published asset never changes: one there already is left as it is.
//
//   node scripts/assets.mjs
//
// Needs gh, signed in with the right to upload to EmileFilm/emile-packs.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const dir = path.join(ROOT, 'assets')
const have = new Set(JSON.parse(execFileSync('gh', ['release', 'view', 'assets', '--json', 'assets'], { cwd: ROOT, encoding: 'utf8' })).assets.map(a => a.name))
const want = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter(f => f.endsWith('.zip') && !have.has(f)).sort()
for (let i = 0; i < want.length; i += 20) {
  const some = want.slice(i, i + 20)
  execFileSync('gh', ['release', 'upload', 'assets', ...some.map(f => path.join(dir, f))], { cwd: ROOT, stdio: 'inherit' })
  console.log(`uploaded ${i + some.length} of ${want.length}`)
}
console.log(want.length ? `${want.length} assets uploaded` : 'every asset is there already')
