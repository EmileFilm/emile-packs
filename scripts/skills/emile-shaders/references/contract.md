{{generated}}

# The shader contract

What every `shader.glsl` here expects from whatever runs it, and what it may do. Émile's compositor and `emile-shaders.js` both keep it; keep it too and a shader runs unchanged.

## The shader

- GLSL ES 3.00 (WebGL2), **without a header**: no `#version`, precision, uniforms, inputs, outputs or `main()`. The wrap below adds them.
- A **filter** defines `vec4 filterColor(vec2 uv)` and reads the picture under it with `getColor(vec2 uv)`. (`filter` is a reserved word in GLSL ES, hence the name.)
- A **transition** defines `vec4 transition(vec2 uv)` and reads `getFromColor(vec2 uv)`, `getToColor(vec2 uv)` and `float progress` (0 at the outgoing picture, 1 at the incoming one): the gl-transitions shape.
- `uv` runs 0–1 from the **bottom left** of the frame.
- Every colour in and out is **premultiplied** (rgb already multiplied by alpha). A picture with no alpha is the same either way.
- It draws in **one pass**: it may read the picture as often as it likes, never its own result.
- It never samples a texture itself (only the getters), declares nothing of its own at the top level but functions and constants, writes no `gl_FragColor`, uses no `discard`, no extension, no name starting `emile_`, and reads no clock.

## What it is given

| Uniform | Type | What |
|---|---|---|
| `resolution` | `vec2` | the frame in pixels |
| `ratio` | `float` | width / height |
| `frame` | `float` | the frame number; what moves reads it (there is no clock) |
| `fps` | `float` | frames a second, so `frame / fps` is seconds |
| `seed` | `float` | 0–65535; the same seed gives the same picture |
| `p_<id>` | per type | one per parameter of `pack.json` |

A parameter's uniform type, from its `type` in `pack.json`:

| `pack.json` | GLSL | Value |
|---|---|---|
| `float` | `float` | as it is |
| `int` | `int` | as it is |
| `bool` | `bool` | as it is |
| `vec2` | `vec2` | `[x, y]` |
| `color` | `vec3` | `"#rrggbb"` as 0–1 per channel |
| `choice` | `int` | the chosen option's index in `options` |

A parameter left out takes its `default`. Sizes are in pixels of a frame 1080 pixels on its short side; the shader scales them by `min(resolution.x, resolution.y) / 1080`, so pass the real resolution and nothing else.

## The wrap

The whole fragment shader is the header, the getters, `#line 1`, the pack's `shader.glsl` as it is, and `main()`. This is exactly what Émile's compositor and `emile-shaders.js` compile (`EmileShaders.fragmentSource(kind, glsl, params)` returns it). `#line 1` makes a compile error name the line in `shader.glsl`.

A filter (here with the parameters of `emile/grain`):

```glsl
{{filterWrap}}
```

A transition:

```glsl
{{transitionWrap}}
```

The vertex shader draws one quad over the frame:

```glsl
#version 300 es
in vec2 pos;
out vec2 uv;
void main() { uv = pos * 0.5 + 0.5; gl_Position = vec4(pos, 0.0, 1.0); }
```

with `pos` the corners `(-1,-1) (1,-1) (-1,1) (1,1)` drawn as a triangle strip.

## Textures

Sample the pictures with `LINEAR` filtering and `CLAMP_TO_EDGE` wrapping, uploaded upright for a bottom-left `uv` (`UNPACK_FLIP_Y_WEBGL` true for an image, a video or a canvas) and premultiplied (`UNPACK_PREMULTIPLY_ALPHA_WEBGL` true). Some shaders read outside 0–1 on purpose (`displace` wraps with `fract`, others clamp); with `CLAMP_TO_EDGE` they look as they do in Émile.
