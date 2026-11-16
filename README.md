<h1 align="center">Émile packs</h1>

<p align="center">
  <b>Fifteen filters and four transitions, free and open, each with a guide an AI reads before it uses one.</b><br>
  For <a href="https://emilefilm.com">Émile</a>, the video editor built for AI — and for any coding agent that makes video.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/licence-MIT-blue" alt="MIT licence">
  <img src="https://img.shields.io/badge/filters-15-orange" alt="15 filters">
  <img src="https://img.shields.io/badge/transitions-4-orange" alt="4 transitions">
  <img src="https://img.shields.io/badge/WebGL2-Chrome%20%26%20WebKit-informational" alt="WebGL2 in Chrome and WebKit">
</p>

<p align="center">
  <a href="#the-filters">Filters</a> ·
  <a href="#use-them">Use them</a> ·
  <a href="#reading-a-skillmd">Reading a SKILL.md</a> ·
  <a href="#for-pack-authors">For pack authors</a>
</p>

<img src="docs/gallery-portrait.jpg" width="100%" alt="One studio portrait through the filters at their defaults">

## What it does

Tell Émile's AI how a moment should feel, and it lays the right filter over it: it picks the pack by what each one brings, reads that pack's guide, and sets it the way the guide says. You never need a filter's name or a parameter.

| Say | What happens |
|---|---|
| "Add a touch of grain." | `emile/grain` over the whole film at amount 0.15–0.25: a light grain is a finish, the one kind of filter that may run the whole length. |
| "Make the flashback feel like an old tape." | `emile/vhs` over that scene only, two to six seconds, then back to the clean present. |
| "Some tape feel, please." | No span named, so the AI asks where, recommending the opening seconds, and says why: tape over a whole product demo blurs its interface. |
| "Turn the whole film navy and cream." | `emile/duotone` with those two colours as hex, over the whole film because it was asked for. |

### Seconds, not minutes

Most filters are an accent: a few seconds on the moment that calls for them — a headline held as a print, a hit on the beat, a memory on tape — between clean shots. Held for a whole film they tire the eye, and over an interface, numbers or body text they hide what the picture is there to say:

<img src="docs/gallery-interface.jpg" width="100%" alt="An app's interface through the filters: the strong ones make its words hard to read">

Every guide says how long its filter holds up, and Émile's AI keeps to it unless you ask for more. The exceptions are finishes light enough to read as a surface: a little grain, paper under an illustrated film, a faint lens fringe.

## The filters

Each has `amount` (0 leaves the picture exactly as it is, 1 is the whole effect) and two to four parameters of its own. Shown at their defaults.

### Print — ink on paper

<table>
<tr>
<td width="33%"><img src="docs/filters/halftone.jpg" alt="halftone"><br><b>Halftone</b> · <code>emile/halftone</code><br>A picture pulled through a printer's screen: ink dots on paper, bold enough to read as print.</td>
<td width="33%"><img src="docs/filters/risograph.jpg" alt="risograph"><br><b>Risograph</b> · <code>emile/risograph</code><br>A two-colour print run: two inks laid one over the other, a little out of register.</td>
<td width="33%"><img src="docs/filters/cmyk.jpg" alt="cmyk"><br><b>CMYK</b> · <code>emile/cmyk</code><br>Four-colour process seen up close: dots that never quite line up.</td>
</tr>
</table>

### Texture — a surface, not an effect

<table>
<tr>
<td width="33%"><img src="docs/filters/grain.jpg" alt="grain"><br><b>Grain</b> · <code>emile/grain</code><br>A picture you can almost touch: fine grain that lives from frame to frame.</td>
<td width="33%"><img src="docs/filters/dither.jpg" alt="dither"><br><b>Dither</b> · <code>emile/dither</code><br>A one-bit picture: two colours, and a pattern of pixels doing the work of every grey.</td>
<td width="33%"><img src="docs/filters/paper.jpg" alt="paper"><br><b>Paper</b> · <code>emile/paper</code><br>Printed on real paper: the tooth of the sheet under the picture, whites warmed to its tone.</td>
</tr>
</table>

### Distort — glass, not glitch

<table>
<tr>
<td width="50%"><img src="docs/filters/fluted-glass.jpg" alt="fluted glass"><br><b>Fluted glass</b> · <code>emile/fluted-glass</code><br>Seen through reeded glass: shapes kept, detail hidden.</td>
<td width="50%"><img src="docs/filters/displace.jpg" alt="displace"><br><b>Displace</b> · <code>emile/displace</code><br>Bands of the picture slip sideways: something has shifted, and holds there.</td>
</tr>
</table>

### Color — fewer inks, more intent

<table>
<tr>
<td width="50%"><img src="docs/filters/duotone.jpg" alt="duotone"><br><b>Duotone</b> · <code>emile/duotone</code><br>The whole picture in two inks: one for the darks, one for the lights.</td>
<td width="50%"><img src="docs/filters/palette.jpg" alt="palette"><br><b>Palette</b> · <code>emile/palette</code><br>A handful of chosen inks, like a screen print, a blueprint or a thermal camera.</td>
</tr>
</table>

### Glow — light from the picture itself

<table>
<tr>
<td width="50%"><img src="docs/filters/bloom.jpg" alt="bloom"><br><b>Bloom</b> · <code>emile/bloom</code><br>Light spills from the brightest points into the dark, with the warm edge film gives it.</td>
<td width="50%"><img src="docs/filters/edge-glow.jpg" alt="edge glow"><br><b>Edge glow</b> · <code>emile/edge-glow</code><br>The outlines of a clear shape light up, like a rim of light behind it. For silhouettes, not faces.</td>
</tr>
</table>

### Film — the medium the picture passes through

<table>
<tr>
<td width="33%"><img src="docs/filters/crt.jpg" alt="crt"><br><b>CRT</b> · <code>emile/crt</code><br>A picture on a glass tube: scan lines, phosphor stripes, a gently curved face.</td>
<td width="33%"><img src="docs/filters/vhs.jpg" alt="vhs"><br><b>VHS</b> · <code>emile/vhs</code><br>A tape played many times: soft, colours bleeding sideways, the bottom edge tearing.</td>
<td width="33%"><img src="docs/filters/chromatic-aberration.jpg" alt="chromatic aberration"><br><b>Chromatic aberration</b> · <code>emile/chromatic-aberration</code><br>A lens that splits light at its edges; the centre stays sharp.</td>
</tr>
</table>

### Transitions

| Pack | What it brings |
|---|---|
| `emile/dissolve` | The two pictures melt into each other, gently at both ends. |
| `emile/push` | The next picture slides in and pushes this one away: onward. |
| `emile/wipe` | A clean, designed change, like turning a page sideways. |
| `emile/zoom` | Flying in: going deeper, into the next idea. |

## Use them

### In Émile

Nothing to install. Say what you want in the chat, or type `#` and a filter's name; the first time a film uses a pack Émile downloads it from here, checks every file against the signed index, and keeps it for offline use. A filter is a clip on the timeline: it changes every track under it for as long as it lasts.

### With your own agent

`skills/emile-shaders/` is a Skill: copy that one folder into your agent's skills folder and it carries everything it needs: every filter's and transition's `shader.glsl`, `pack.json` and `SKILL.md`, a one-file WebGL2 runner, an example page and the references. For Claude Code that is `.claude/skills/` in your project (or `~/.claude/skills/` for every project):

```bash
git clone --depth 1 https://github.com/EmileFilm/emile-packs.git
cp -R emile-packs/skills/emile-shaders .claude/skills/
```

Then ask for the look ("put a halftone on the video in this page"): the agent finds the Skill, reads the filter's guide and wires the shader into your page. For any other agent, put the folder wherever it reads Skills from.

Without installing: hand your agent this repository's link, or clone it next to your project and point the agent at `skills/emile-shaders/SKILL.md`.

### In your own code

`skills/emile-shaders/emile-shaders.js` runs any of the shaders with plain WebGL2, unchanged: a filter over an image, a `<video>` or a canvas, a transition between two pictures. `references/wiring.md` shows each in a few lines and what to keep when you wire them into another renderer; `references/contract.md` is the shader contract and the exact GLSL wrap Émile uses. Open `skills/emile-shaders/example.html` (straight from the folder, no server) to see every effect with its parameters as sliders.

## Reading a SKILL.md

A filter here is not just a shader. Each pack's `SKILL.md` is a short guide written for an AI to read, not a person to skim — the judgement of someone who has looked at the filter on real pictures. Its sections:

| Section | What it holds |
|---|---|
| first line | The feeling it brings, in a sentence. |
| Role | Its role when filters are stacked: colour, structure, optics, medium or finish. |
| When to use | The moments in a story that call for it, each with the settings that work, and the words people use when they want it. |
| Suits / Doesn't suit | The pictures it holds up on and the ones it fails on — product shots, interfaces, portraits by day and in low light — with the setting that mends a failure where one exists. |
| The tired version | The tired version of the effect, named outright, so nobody falls back into it. |
| How long | How long it holds up: seconds for most, the whole film only for a light finish. |
| Parameters | Each parameter with the values that actually work, not just its range. |

For example, from `emile/displace`:

> **How long** — An accent: 0.3–1.5 seconds, on the beat or the moment something goes wrong. Past two seconds it means nothing.

An agent that reads this before it places a filter picks the right one, sets it well, keeps it short, and tells you when your picture is one it fails on.

## For pack authors

<details>
<summary><b>A pack</b>: the folder, <code>pack.json</code> and the shader contract</summary>

A folder `<publisher>/<name>/`:

- `pack.json`: `id` (`emile/grain`), `kind` (`filter`, `transition` or `look`), `version` (semver; a published version never changes), `title` and `description` (`en`, `zh-CN`; the description says the feeling, not the technique), `category` (filters: `print`, `texture`, `distort`, `color`, `glow`, `film`), `params` (`[{ id, type: float | int | bool | color | vec2 | choice, default, min, max, step, options, label }]`), `animated`, `backends` (`{ "glsl": "shader.glsl" }`), `licence`, `publisher`.
- `shader.glsl`: GLSL ES 3.00 without a header. Colours in and out are premultiplied; `uv` runs 0–1 from the bottom left.
  - a filter defines `vec4 filterColor(vec2 uv)` and reads the picture under it with `getColor(uv)`;
  - a transition defines `vec4 transition(vec2 uv)` and reads `getFromColor(uv)`, `getToColor(uv)` and `progress` (0–1), the [gl-transitions](https://github.com/gl-transitions/gl-transitions) shape;
  - both get `vec2 resolution`, `float ratio`, `float frame`, `float fps`, `float seed`, and one uniform `p_<id>` per parameter (`color` is a `vec3`, `choice` the chosen option's index as an `int`). There is no clock: what moves reads `frame` and `seed`.
  - a shader declares no uniforms, inputs or outputs of its own, samples no texture directly, defines no `main()` and uses no extension. It can read the picture as often as it likes, never its own result.
  - a filter that needs a wide reach (a glow, a blur) may draw in passes: `passes` in `pack.json` lists them (`[{ id, glsl, scale }]`), each pass's shader defines `vec4 passColor(vec2 uv)` and is drawn into a picture of its own at `scale` × the frame, and the passes after it and the last shader read it with `getPass_<id>(uv)` (`skills/emile-shaders/references/contract.md`, Passes; `emile/bloom` is one).
  - sizes are in pixels of a frame 1080 pixels on its short side (or a share of that side), so 720p and 4K look alike, upright and square frames too.
- `SKILL.md`: the sections [above](#reading-a-skillmd).

</details>

<details>
<summary><b>The bar</b>: what a filter clears before it is published</summary>

Few good ones over many. A filter is published when it clears this, not when it compiles.

**Measured** by `scripts/review.mjs`, which draws each filter with Émile's own compositor over a product on a backdrop by day and by night, a product's screen, shapes on nothing, and the photographs given to it (portraits above all: a face is where a filter fails first):

```bash
node scripts/review.mjs --out <a folder outside this repository> --photo <portrait.jpg> --photo <another.jpg>
node scripts/review.mjs --out <folder> --photo <dark-portrait.jpg> --set halftone.exposure=0.7 halftone   # try what a SKILL.md recommends
node scripts/review.mjs --out <folder> --photo <portrait.jpg> --quick --no-measure --tiles docs/filters --tile-base bloom=night   # the cards above
```

- ✗ keeps a filter out: `amount` 0 changes a byte of the frame; one frame drawn twice differs; a filter that isn't `animated` changes between frames, or an animated one makes the whole frame's brightness wander; 720p and 4K don't look alike; a 1080p frame costs more than 4 ms.
- △ is answered in its SKILL.md: on some kind of picture, at its defaults, less than 0.7 of the run from dark to light is left, or the picture is hard to find in it (rank correlation under 0.6). The kind of picture goes under Doesn't suit, or the setting that mends it is given and tried with `--set`.

**Judged** from the sheets it writes (each picture as it is, at the defaults and at `amount` 0.5; pieces of the 1080p frame pixel for pixel; upright and square frames; one gallery per picture with every filter side by side, like the two above). Each answer must be yes:

1. **At a glance.** In the gallery, is the filter itself, and is the subject still the subject?
2. **Not the tired version.** Name the most worn-out version of this effect. Do the defaults avoid every mark of it?
3. **A process, not a decoration.** Does it follow how a real thing works (ink on paper, glass, tape, a tube, a lens), so you could say what in the world it is?
4. **Few colours.** Is the frame carried by the picture's own colours, or by at most five chosen ones, none neon by default?
5. **Half is still a look.** At `amount` 0.5, is it a lighter version of the same thing, not a dirty mix of two pictures?
6. **A reason in a film.** Can you name three moments of a story that call for it, how long it holds up, and the pictures it fails on?

</details>

<details>
<summary><b>Releases</b>: the signed index</summary>

`index.json` lists every pack's newest version with each file's size and SHA-256; `index.json.sig` is its Ed25519 signature. Émile holds the public key, refuses an index whose signature doesn't match, and keeps out a pack with a file whose hash doesn't. Files are served by jsDelivr from the release's tag.

To publish, with the Émile repository beside this one:

```bash
node scripts/build.mjs --check                        # check every pack, write nothing
node scripts/build.mjs --tag v1.1.0 --key <key.pem>   # check, hash, write index.json, sign it
git commit -am "…" && git tag v1.1.0 && git push --follow-tags
```

The check compiles every shader with WebGL2 in Chrome and in the Mac's WebKit, so it runs on a Mac. The private key is never committed.

</details>

## Licence

MIT (see `LICENSE`). Every shader, name and parameter here is written for Émile; none copies another product's code, presets or examples. The portrait in the previews is by [Samuel Dixon](https://unsplash.com/@samueldixon) on [Unsplash](https://unsplash.com/photos/photo-of-woman-looking-right--fQ5XNOcqFQ), under the Unsplash License; the other pictures are drawn by `scripts/review.html`.
