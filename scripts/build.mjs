#!/usr/bin/env node
// Builds this repository: every pack checked, the generated Skills
// written, every file hashed, index.json written and signed.
//
//   node scripts/build.mjs --tag v1.0.0 [--key <ed25519 private key .pem>] [--engine <Emile/engine>]
//   node scripts/build.mjs --check          (check every pack and that the generated Skills are current, write nothing)
//   node scripts/build.mjs --public-key --key <pem>   (the key's public half, for the engine)
//
// 1. check: each <publisher>/<name>/ folder with a pack.json goes through
//    the engine's pack check (pack.json, the shader contract, compiled with
//    WebGL2 in Chrome and in WebKit); one problem stops the build. The
//    Skill's runner (emile-shaders.js) must wrap every shader exactly as
//    the engine's compositor does
// 2. generate: skills/emile-shaders/ (the Skill other people's agents
//    install: every pack's files as they are, the runner, the example page,
//    the references) and skills/choosing-filters/ (an official reference
//    Skill for Émile), from the packs and the templates in scripts/skills/.
//    --check fails when what is on disk differs from what would be written
// 3. hash: each file of each pack and of each Skill for Émile (every
//    skills/<name>/ but emile-shaders), its size and SHA-256; and its
//    preview (preview.mp4 and preview.jpg beside its files, drawn by
//    scripts/previews.mjs, never here), listed apart from its files: a
//    preview changes no version and no digest. Whatever changes the
//    picture has one: a pack, or a Skill whose front matter says kind: look,
//    without both preview files stops the build (a Skill that is only a
//    function, kind: tool or none, needs none)
// 4. index: index.json, the packs sorted by id, the Skills by name; a pack
//    whose files changed while its version didn't is refused (a published
//    version never changes). Nothing changed since the last build: the
//    same index, its date kept, so a second run changes nothing
// 5. sign: index.json signed with Ed25519 into index.json.sig (base64). The
//    private key never goes into this repository (--key or EMILE_PACKS_KEY)
//
// The engine (the Émile repository's engine/) does the checking: --engine
// or EMILE_ENGINE, else ../Emile/engine beside this repository.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import { generateSkills, GENERATED } from './skills.mjs'

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
  .filter(e => e.isDirectory() && !e.name.startsWith('.') && !['scripts', 'node_modules', 'skills', 'docs'].includes(e.name))
  .flatMap(pub => fs.readdirSync(path.join(ROOT, pub.name), { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT, pub.name, e.name, 'pack.json')))
    .map(e => path.join(ROOT, pub.name, e.name)))
  .sort()
if (!packDirs.length) fail('no packs (<publisher>/<name>/pack.json)')

// 1. check
const engine = path.resolve(values.engine ?? process.env.EMILE_ENGINE ?? path.join(ROOT, '..', 'Emile', 'engine'))
const checker = path.join(engine, 'emile', 'packs', 'check.mjs')
if (!fs.existsSync(checker)) fail(`no engine at ${engine} (--engine or EMILE_ENGINE: the Émile repository's engine/)`)
const { checkPacks, walk, packFiles } = await import(pathToFileURL(checker).href)
const { PREVIEW, isPreviewFile } = await import(pathToFileURL(path.join(engine, 'emile', 'library', 'previews.mjs')).href)
const checked = await checkPacks(packDirs)
console.log(`compiled with WebGL2 in ${checked.renderers.chrome} (Chrome) and ${checked.renderers.webkit} (WebKit)`)
let bad = 0
for (const p of checked.packs) {
  console.log(`${p.problems.length ? '✗' : '✓'} ${p.id ?? path.relative(ROOT, p.dir)} ${p.version ?? ''}${p.chrome ? ` · Chrome ${p.chrome.ok ? 'ok' : 'fails'} · WebKit ${p.webkit.ok ? 'ok' : 'fails'}` : ''}`)
  for (const problem of p.problems) console.log(`    ${problem}`)
  bad += p.problems.length ? 1 : 0
}
if (bad) fail(`${bad} pack${bad > 1 ? 's' : ''} with problems`)

// The Skill's runner wraps every shader as the compositor does, byte for byte
const contract = await import(pathToFileURL(path.join(engine, 'core', 'compose', 'contract.js')).href)
const runner = {}
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'scripts', 'skills', 'emile-shaders', 'emile-shaders.js'), 'utf8'), runner)
const wrapped = packDirs.map(dir => {
  const pack = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8'))
  const glsl = fs.readFileSync(path.join(dir, pack.backends.glsl), 'utf8')
  const ids = (pack.passes ?? []).map(p => p.id)
  const wraps = [[pack.kind, glsl, ids], ...(pack.passes ?? []).map((p, i) => ['pass', fs.readFileSync(path.join(dir, p.glsl), 'utf8'), ids.slice(0, i)])]
  const same = wraps.every(([kind, text, earlier]) => runner.EmileShaders.fragmentSource(kind, text, pack.params, earlier) === contract.fragmentSource(kind, text, pack.params, earlier))
    && JSON.stringify(runner.EmileShaders.paramValues(pack.params)) === JSON.stringify(contract.paramValues(pack.params))
  return same ? null : pack.id
}).filter(Boolean)
if (wrapped.length) fail(`emile-shaders.js wraps ${wrapped.join(', ')} differently from the engine's compose/contract.js: make its fragmentSource and paramValues the same`)
console.log(`✓ emile-shaders.js wraps the shaders of all ${packDirs.length} packs, passes too, as the compositor does`)

// 2. generate
const { scanSkill } = await import(pathToFileURL(checker).href)
const generated = generateSkills(ROOT, packDirs, contract)
const stale = []
for (const skill of GENERATED) {
  const dir = path.join(ROOT, 'skills', skill)
  const want = new Map([...generated].filter(([rel]) => rel.startsWith(`skills/${skill}/`)))
  const have = walk(dir).filter(f => !isPreviewFile(path.relative(dir, f))).map(f => path.relative(ROOT, f).split(path.sep).join('/'))
  for (const rel of have) if (!want.has(rel)) stale.push(`${rel} is not generated any more`)
  for (const [rel, bytes] of want) {
    const file = path.join(ROOT, rel)
    if (!fs.existsSync(file)) stale.push(`${rel} is missing`)
    else if (!fs.readFileSync(file).equals(bytes)) stale.push(`${rel} is out of date`)
  }
}
if (values.check) {
  if (stale.length) fail(`the generated Skills are out of date (run the build to write them):\n    ${stale.join('\n    ')}`)
  console.log(`✓ skills/${GENERATED.join(', skills/')} are current`)
  process.exit(0)
}
if (!values.tag || !/^v\d+\.\d+\.\d+$/.test(values.tag)) fail('--tag vX.Y.Z: the release this index is published as (its files are served from that tag)')
const key = privateKey()
for (const skill of GENERATED) {
  const dir = path.join(ROOT, 'skills', skill)
  for (const f of walk(dir)) if (!isPreviewFile(path.relative(dir, f)) && !generated.has(path.relative(ROOT, f).split(path.sep).join('/'))) fs.rmSync(f)
}
for (const [rel, bytes] of generated) {
  const file = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (!fs.existsSync(file) || !fs.readFileSync(file).equals(bytes)) fs.writeFileSync(file, bytes)
}
console.log(stale.length ? `skills/${GENERATED.join(', skills/')}: ${stale.length} file${stale.length > 1 ? 's' : ''} written` : `skills/${GENERATED.join(', skills/')}: current`)

// 3. hash
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const fileEntry = (dir, f) => ({ path: path.relative(dir, f).split(path.sep).join('/'), bytes: fs.statSync(f).size, sha256: sha256(f) })
// An entry's preview: both files, or none (a card in Émile then stays words)
const previewOf = dir => {
  const [video, still] = [PREVIEW.video, PREVIEW.still].map(f => path.join(dir, f))
  return fs.existsSync(video) && fs.existsSync(still) ? { video: fileEntry(dir, video), still: fileEntry(dir, still) } : null
}
const packs = packDirs.map(dir => {
  const pack = JSON.parse(fs.readFileSync(path.join(dir, 'pack.json'), 'utf8'))
  return {
    id: pack.id, version: pack.version, kind: pack.kind, category: pack.category ?? null,
    title: pack.title, description: pack.description, params: pack.params, preview: previewOf(dir),
    licence: pack.licence, files: packFiles(dir).map(f => fileEntry(dir, f))
  }
}).sort((a, b) => a.id.localeCompare(b.id))

// The Skills for Émile: every skills/<name>/ with a SKILL.md but the one
// for other people's agents. Its card from SKILL.md: the first heading,
// the front matter's description; digest: the SHA-256 of its files' list
const skillsDir = path.join(ROOT, 'skills')
const skills = (fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir, { withFileTypes: true }) : [])
  .filter(e => e.isDirectory() && e.name !== 'emile-shaders' && fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md')))
  .map(e => {
    const dir = path.join(skillsDir, e.name)
    const text = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8')
    for (const f of walk(dir).filter(f => f.endsWith('.md'))) {
      const problems = scanSkill(fs.readFileSync(f, 'utf8'))
      if (problems.length) fail(`${path.relative(ROOT, f)}: ${problems.join('; ')}`)
    }
    const description = /^---\r?\n[\s\S]*?^description:\s*(.+)$[\s\S]*?\r?\n---/m.exec(text)?.[1].trim()
    // look: it changes the picture (in Émile's 灵感, with its preview); tool: a function (the chat's Skill button)
    const kind = /^---\r?\n[\s\S]*?^kind:\s*(\w+)\s*$[\s\S]*?\r?\n---/m.exec(text)?.[1] === 'look' ? 'look' : 'tool'
    const title = /^#\s+(.+)$/m.exec(text.replace(/^---\r?\n[\s\S]*?\r?\n---/, ''))?.[1].trim()
    if (!description || !title) fail(`skills/${e.name}/SKILL.md needs a front matter description and a # heading (its card in Émile)`)
    const files = walk(dir).filter(f => !isPreviewFile(path.relative(dir, f))).map(f => fileEntry(dir, f))
    const digest = crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex')
    return { name: e.name, title, description, kind, licence: 'MIT', digest, preview: previewOf(dir), files }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

// Whatever changes the picture has its preview
const unseen = [...packs.filter(p => !p.preview).map(p => p.id), ...skills.filter(s => s.kind === 'look' && !s.preview).map(s => `skills/${s.name} (kind: look)`)]
if (unseen.length) fail(`these change the picture but have no preview.mp4 and preview.jpg: ${unseen.join(', ')} (node scripts/previews.mjs; a Skill's preview is looked at before it goes in)`)

// 4. index: a version once published keeps its files
const indexFile = path.join(ROOT, 'index.json')
const before = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : null
for (const p of packs) {
  const was = before?.packs.find(x => x.id === p.id && x.version === p.version)
  if (was && JSON.stringify(was.files) !== JSON.stringify(p.files)) fail(`${p.id} ${p.version} changed since it was published: give it a new version in its pack.json`)
}
const index = { format: FORMAT, tag: values.tag, published: new Date().toISOString(), contract: contract.CONTRACT, packs, skills }
// Nothing changed: the date it was published stays
if (before && JSON.stringify({ ...before, published: null }) === JSON.stringify({ ...index, published: null })) index.published = before.published
const bytes = Buffer.from(JSON.stringify(index, null, 1) + '\n')

// 5. sign (Ed25519 signs the same bytes the same way)
const sig = crypto.sign(null, bytes, key).toString('base64')
const unchanged = before && index.published === before.published
fs.writeFileSync(indexFile, bytes)
fs.writeFileSync(path.join(ROOT, 'index.json.sig'), sig + '\n')
console.log(`index.json: ${packs.length} packs, ${skills.length} Skill${skills.length === 1 ? '' : 's'} for Émile, ${values.tag}, signed (index.json.sig)${unchanged ? ', unchanged' : ''}`)
