---
name: emile-shaders
description: Fourteen GLSL filters (halftone, risograph, CMYK, grain, dither, paper, fluted glass, displace, duotone, palette, bloom, CRT, VHS, chromatic aberration) and four transitions (dissolve, push, wipe, zoom) for images and video in a browser, with a one-file WebGL2 runner and a guide per effect on when it fits, the settings that work and how long it holds up. Use when a web page, canvas, video element, slideshow or rendered frame needs a print, texture, glass, colour, glow or film look, or a shader transition between two pictures. Not for blurs, colour grading by curves or LUTs, or 3D lighting.
---

{{generated}}

# Émile shaders

Fourteen filters and four transitions from Émile, a video editor, as plain files: each a `shader.glsl` (GLSL ES 3.00, no header), a `pack.json` (its parameters, ranges and defaults) and a `SKILL.md` (when it fits, the settings that work, the pictures it fails on, how long it holds up). `emile-shaders.js` runs any of them with WebGL2 in a few lines; `example.html` shows them all on a picture with their parameters as sliders.

## Filters

Every filter has `amount` (0 leaves the picture exactly as it is, 1 is the whole effect) and two to four parameters of its own.

{{filters}}

## Transitions

`progress` runs 0 to 1 over the change; none has parameters.

{{transitions}}

## Rules

- **Read the effect's own guide before you use it**: `filters/<name>/SKILL.md` or `transitions/<name>/SKILL.md`. Use its values, not the defaults alone, and check its Doesn't suit against the picture (a dark picture, an interface, small type).
- **A filter is an accent of a few seconds, not the whole video.** Most hold up for 1–5 seconds on the moment that calls for them, between clean shots. Only a light finish may run the whole length: `grain` at amount 0.25 or under, `paper` on an illustrated piece, `chromatic-aberration` in lens mode at a low strength. Keep strong filters off text, numbers and interfaces that must be read; put those above the filtered layer instead.
- **Colours are premultiplied**, in and out: upload pictures with `UNPACK_PREMULTIPLY_ALPHA_WEBGL` (the runner does) and blend the result with `ONE, ONE_MINUS_SRC_ALPHA`.
- **Run `shader.glsl` unchanged** inside the wrap (`emile-shaders.js`, or `references/contract.md` for your own renderer). Don't paste it into another shader's `main()` or rename its functions.
- **No clock.** A moving filter reads `frame` and `fps`; advance `frame` yourself, and keep `seed` fixed so the same frame is the same picture.
- Sizes are in pixels of a frame 1080 pixels on its short side; the shaders scale them, so 720p and 4K look alike.

## What to read

| To | Read |
|---|---|
| Choose a filter for a moment, or check one against the picture | `references/choosing.md`, then that filter's `SKILL.md` |
| Set a filter's parameters | its `SKILL.md` (Parameters) and `pack.json` (types, ranges, defaults) |
| Put one on an image, a `<video>` or a canvas in a page | `references/wiring.md`, `emile-shaders.js` |
| A transition between two pictures | `references/wiring.md` (Transitions) |
| See every effect and try its parameters | open `example.html` |
| Use them in another renderer (a 3D library's post-processing, offline frames, a native app) | `references/wiring.md` (Elsewhere), `references/contract.md` |
| What a shader is given and may do | `references/contract.md` |
