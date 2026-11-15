# Émile packs

The free filters and transitions for [Émile](https://emilefilm.com), the video editor built for AI. Émile ships no packs of its own: it downloads them from this repository the first time a film uses one, checks every file, and keeps them on the Mac for offline use.

## Filters

A filter is a clip on the timeline that changes every track under it. Each has `amount` (0 leaves the picture exactly as it is, 1 is the whole effect) and two to four parameters of its own.

| Pack | What it brings |
|---|---|
| **Print** | |
| `emile/halftone` | A picture pulled through a printer's screen: ink dots on paper, bold enough to read as print. |
| `emile/risograph` | A two-colour print run: two inks laid one over the other, a little out of register, on uncoated paper. |
| `emile/cmyk` | Four-colour process seen up close: cyan, magenta, yellow and black dots that never quite line up. |
| **Texture** | |
| `emile/grain` | A picture you can almost touch: fine grain that lives from frame to frame. |
| `emile/dither` | A one-bit picture: two colours, and a pattern of pixels doing the work of every grey. |
| `emile/paper` | Printed on real paper: the tooth of the sheet under the picture, whites warmed to the paper's tone. |
| **Distort** | |
| `emile/fluted-glass` | Seen through reeded glass: the picture breaks into upright ribs of light, its shapes kept, its detail hidden. |
| `emile/displace` | Bands of the picture slip sideways: something has shifted, and holds there. |
| **Color** | |
| `emile/duotone` | The whole picture in two inks: one for the darks, one for the lights. |
| `emile/palette` | The picture reduced to a handful of chosen inks, like a screen print, a blueprint or a thermal camera. |
| **Glow** | |
| `emile/bloom` | Light spills from the brightest points into the dark around them, with the warm edge film gives it. |
| **Film** | |
| `emile/crt` | A picture on a glass tube: scan lines, phosphor stripes, a gently curved face. |
| `emile/vhs` | A tape that has been played many times: soft, colours bleeding sideways, the bottom edge tearing. |
| `emile/chromatic-aberration` | A lens that splits light at its edges: colours part towards the corners, the centre stays sharp. |

## Transitions

| Pack | What it brings |
|---|---|
| `emile/dissolve` | The two pictures melt into each other, gently at both ends. |
| `emile/push` | The next picture slides in and pushes this one away: onward. |
| `emile/wipe` | A clean, designed change, like turning a page sideways. |
| `emile/zoom` | Flying in: going deeper, into the next idea. |

## A pack

A folder `<publisher>/<name>/`:

- `pack.json`: `id` (`emile/grain`), `kind` (`filter`, `transition` or `look`), `version` (semver; a published version never changes), `title` and `description` (`en`, `zh-CN`; the description says the feeling, not the technique), `category` (filters: `print`, `texture`, `distort`, `color`, `glow`, `film`), `params` (`[{ id, type: float | int | bool | color | vec2 | choice, default, min, max, step, options, label }]`), `animated`, `backends` (`{ "glsl": "shader.glsl" }`), `licence`, `publisher`.
- `shader.glsl`: GLSL ES 3.00 without a header. Colours in and out are premultiplied; `uv` runs 0–1 from the bottom left.
  - a filter defines `vec4 filterColor(vec2 uv)` and reads the picture under it with `getColor(uv)`;
  - a transition defines `vec4 transition(vec2 uv)` and reads `getFromColor(uv)`, `getToColor(uv)` and `progress` (0–1), the [gl-transitions](https://github.com/gl-transitions/gl-transitions) shape;
  - both get `vec2 resolution`, `float ratio`, `float frame`, `float fps`, `float seed`, and one uniform `p_<id>` per parameter (`color` is a `vec3`, `choice` the chosen option's index as an `int`). There is no clock: what moves reads `frame` and `seed`.
  - a shader declares no uniforms, inputs or outputs of its own, samples no texture directly, defines no `main()` and uses no extension. It draws in one pass: it can read the picture as often as it likes, never its own result.
  - sizes are in pixels of a frame 1080 pixels on its short side (or a share of that side), so 720p and 4K look alike, upright and square frames too.
- `SKILL.md`: what Émile's AI reads, as data, before it uses the pack:
  - one line and a paragraph: the feeling it brings;
  - `角色`: its place when filters are stacked (colour, structure, optics, medium, finish);
  - `何时用`: the moments in a story that call for it, each with its settings, and the words a person might use for it, in English and Chinese. A filter serves what the film is saying; none is decoration;
  - `适合` / `不适合`: the kinds of picture it holds on and fails on, as the review below showed them, with the setting that mends a failure where there is one;
  - `俗套`: the tired version of the effect, and how not to fall back into it;
  - `参数`: each parameter with the values that work.

## The bar

A filter is published when it clears this, not when it compiles. Few good ones over many.

**Measured** by `scripts/review.mjs`, which draws each filter with Émile's own compositor over a product on a backdrop by day and by night, a product's screen, shapes on nothing, and the photographs given to it (portraits above all: a face is where a filter fails first):

```bash
node scripts/review.mjs --out <a folder outside this repository> --photo <portrait.jpg> --photo <another.jpg>
node scripts/review.mjs --out <folder> --photo <dark-portrait.jpg> --set halftone.exposure=0.7 halftone   # try what a SKILL.md recommends
```

- ✗ keeps a filter out: `amount` 0 changes a byte of the frame; one frame drawn twice differs; a filter that isn't `animated` changes between frames, or an animated one makes the whole frame's brightness wander; 720p and 4K don't look alike; a 1080p frame costs more than 4 ms.
- △ is answered in its SKILL.md: on some kind of picture, at its defaults, less than 0.7 of the run from dark to light is left, or the picture is hard to find in it (rank correlation under 0.6). The kind of picture goes under `不适合`, or the setting that mends it is given and tried with `--set`.

**Judged** from the sheets it writes (each picture as it is, at the defaults and at `amount` 0.5; pieces of the 1080p frame pixel for pixel; upright and square frames; one gallery per picture with every filter side by side). Each answer must be yes:

1. **At a glance.** In the gallery, is the filter itself, and is the subject still the subject?
2. **Not the tired version.** Name the most worn-out version of this effect. Do the defaults avoid every mark of it?
3. **A process, not a decoration.** Does it follow how a real thing works (ink on paper, glass, tape, a tube, a lens), so you could say what in the world it is?
4. **Few colours.** Is the frame carried by the picture's own colours, or by at most five chosen ones, none neon by default?
5. **Half is still a look.** At `amount` 0.5, is it a lighter version of the same thing, not a dirty mix of two pictures?
6. **A reason in a film.** Can you name three moments of a story that call for it, and the pictures it fails on?

## Releases

`index.json` lists every pack's newest version with each file's size and SHA-256; `index.json.sig` is its Ed25519 signature. Émile holds the public key, refuses an index whose signature doesn't match, and keeps out a pack with a file whose hash doesn't. Files are served by jsDelivr from the release's tag.

To publish, with the Émile repository beside this one:

```bash
node scripts/build.mjs --check                        # check every pack, write nothing
node scripts/build.mjs --tag v1.1.0 --key <key.pem>   # check, hash, write index.json, sign it
git commit -am "…" && git tag v1.1.0 && git push --follow-tags
```

The check compiles every shader with WebGL2 in Chrome and in the Mac's WebKit, so it runs on a Mac. The private key is never committed.

## Licence

MIT (see `LICENSE`). Every pack here is written for Émile; none copies another product's code, presets or examples.
