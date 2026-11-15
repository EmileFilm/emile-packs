# Émile packs

The free filters and transitions for [Émile](https://emilefilm.com), the video editor built for AI. Émile ships no packs of its own: it downloads them from this repository the first time a film uses one, checks every file, and keeps them on the Mac for offline use.

| Pack | Kind | What it brings |
|---|---|---|
| `emile/grain` | filter · texture | A picture you can almost touch: fine grain that lives from frame to frame. |
| `emile/halftone` | filter · print | Like a photo in an old newspaper: the picture made of ink dots on paper. |
| `emile/dissolve` | transition | The two pictures melt into each other, gently at both ends. |
| `emile/push` | transition | The next picture slides in and pushes this one away: onward. |
| `emile/wipe` | transition | A clean, designed change, like turning a page sideways. |
| `emile/zoom` | transition | Flying in: going deeper, into the next idea. |

## A pack

A folder `<publisher>/<name>/`:

- `pack.json`: `id` (`emile/grain`), `kind` (`filter`, `transition` or `look`), `version` (semver; a published version never changes), `title` and `description` (`en`, `zh-CN`; the description says the feeling, not the technique), `category` (filters: `print`, `texture`, `distort`, `color`, `glow`, `film`), `params` (`[{ id, type: float | int | bool | color | vec2 | choice, default, min, max, step, options, label }]`), `animated`, `backends` (`{ "glsl": "shader.glsl" }`), `licence`, `publisher`.
- `shader.glsl`: GLSL ES 3.00 without a header. Colours in and out are premultiplied; `uv` runs 0–1 from the bottom left.
  - a filter defines `vec4 filterColor(vec2 uv)` and reads the picture under it with `getColor(uv)`;
  - a transition defines `vec4 transition(vec2 uv)` and reads `getFromColor(uv)`, `getToColor(uv)` and `progress` (0–1), the [gl-transitions](https://github.com/gl-transitions/gl-transitions) shape;
  - both get `vec2 resolution`, `float ratio`, `float frame`, `float fps`, `float seed`, and one uniform `p_<id>` per parameter (`color` is a `vec3`, `choice` the chosen option's index as an `int`). There is no clock: what moves reads `frame` and `seed`.
  - a shader declares no uniforms, inputs or outputs of its own, samples no texture directly, defines no `main()` and uses no extension.
- `SKILL.md`: the feeling it brings, its role when filters are stacked, what it suits and what not. Émile's AI reads it as data.

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
