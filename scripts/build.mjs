#!/usr/bin/env node
// Builds the index of this repository's packs: every pack checked, every
// file hashed, index.json written and signed.
//
//   node scripts/build.mjs --tag v1.0.0 [--key <ed25519 private key .pem>] [--engine <Emile/engine>]
//   node scripts/build.mjs --check          (check every pack, write nothing)
//   node scripts/build.mjs --public-key --key <pem>   (the key's public half, for the engine)
//
// 1. check: each <publisher>/<name>/ folder with a pack.json goes through
//    the engine's pack check (pack.json, the shader contract, compiled with
//    WebGL2 in Chrome and in WebKit); one problem stops the build
// 2. hash: each file of each pack, its size and SHA-256
// 3. index: index.json, the packs sorted by id; a pack whose files changed
//    while its version didn't is refused (a published version never changes)
// 4. sign: index.json signed with Ed25519 into index.json.sig (base64). The
//    private key never goes into this repository (--key or EMILE_PACKS_KEY)
//
// The engine (the Émile repository's engine/) does the checking: --engine
// or EMILE_ENGINE, else ../Emile/engine beside this repository.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const FORMAT = 1

const { values } = parseArgs({
  options: {
    tag: { type: 'string' },
    key: { type: 'string' },
    engine: { type: 'string' },
    check: { type: 'boolean' },
    'public-key': { type: 'boolean' }
  }
})

const fail = message => {
  console.error(`build: ${message}`)
  process.exit(1)
}

const keyFile = values.key ?? process.env.EMILE_PACKS_KEY
const privateKey = () => {
  if (!keyFile) fail('no signing key: --key <file.pem> or EMILE_PACKS_KEY (the private key is kept outside this repository)')
  return crypto.createPrivateKey(fs.readFileSync(keyFile))
}

if (values['public-key']) {
  console.log(crypto.createPublicKey(privateKey()).export({ format: 'der', type: 'spki' }).toString('base64'))
  process.exit(0)
}

// Every pack folder: <publisher>/<name>/pack.json
const packDirs = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'scripts' && e.name !== 'node_modules')
  .flatMap(pub => fs.readdirSync(path.join(ROOT, pub.name), { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT, pub.name, e.name, 'pack.json')))
    .map(e => path.join(ROOT, pub.name, e.name)))
  .sort()
if (!packDirs.length) fail('no packs (<publisher>/<name>/pack.json)')

// 1. check
const engine = path.resolve(values.engine ?? process.env.EMILE_ENGINE ?? path.join(ROOT, '..', 'Emile', 'engine'))
const checker = path.join(engine, 'emile', 'packs', 'check.mjs')
if (!fs.existsSync(checker)) fail(`no engine at ${engine} (--engine or EMILE_ENGINE: the Émile repository's engine/)`)
const { checkPacks, walk } = await import(pathToFileURL(checker).href)
const checked = await checkPacks(packDirs)
console.log(`compiled with WebGL2 in ${checked.renderers.chrome} (Chrome) and ${checked.renderers.webkit} (WebKit)`)
let bad = 0
for (const p of checked.packs) {
  console.log(`${p.problems.length ? '✗' : '✓'} ${p.id ?? path.relative(ROOT, p.dir)} ${p.version ?? ''}${p.chrome ? ` · Chrome ${p.chrome.ok ? 'ok' : 'fails'} · WebKit ${p.webkit.ok ? 'ok' : 'fails'}` : ''}`)
  for (const problem of p.problems) console.log(`    ${problem}`)
  bad += p.problems.length ? 1 : 0
}
if (bad) fail(`${bad} pack${bad > 1 ? 's' : ''} with problems`)
if (values.check) process.exit(0)
if (!values.tag || !/^v\d+\.\d+\.\d+$/.test(values.tag)) fail('--tag vX.Y.Z: the release this index is published as (its files are served from that tag)')

// 2. hash
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const packs = packDirs.map(dir => {
  const pack = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8'))
  const files = walk(dir).map(f => ({ path: path.relative(dir, f).split(path.sep).join('/'), bytes: fs.statSync(f).size, sha256: sha256(f) }))
  return {
    id: pack.id, version: pack.version, kind: pack.kind, category: pack.category ?? null,
    title: pack.title, description: pack.description, params: pack.params, preview: pack.preview ?? null,
    licence: pack.licence, files
  }
}).sort((a, b) => a.id.localeCompare(b.id))

// 3. index: a version once published keeps its files
const indexFile = path.join(ROOT, 'index.json')
const before = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : null
for (const p of packs) {
  const was = before?.packs.find(x => x.id === p.id && x.version === p.version)
  if (was && JSON.stringify(was.files) !== JSON.stringify(p.files)) fail(`${p.id} ${p.version} changed since it was published: give it a new version in its pack.json`)
}
const { CONTRACT } = await import(pathToFileURL(path.join(engine, 'emile', 'compose', 'contract.js')).href)
const index = { format: FORMAT, tag: values.tag, published: new Date().toISOString(), contract: CONTRACT, packs }
const bytes = Buffer.from(JSON.stringify(index, null, 1) + '\n')

// 4. sign
const sig = crypto.sign(null, bytes, privateKey()).toString('base64')
fs.writeFileSync(indexFile, bytes)
fs.writeFileSync(path.join(ROOT, 'index.json.sig'), sig + '\n')
console.log(`index.json: ${packs.length} packs, ${values.tag}, signed (index.json.sig)`)
