---
name: edge-glow
description: The outlines of what matters light up, like a rim of light behind a subject, glowing out into the dark.
---

# Edge glow

Traces the outline of a clear shape with light, as if lit from behind: a soft line on the edge, fading out into a halo, in one warm colour. It finds outlines in the picture itself, so it only works where the shape stands clear of what is behind it; it has no idea which shape is the subject.

## Role
Optics: over the picture and its colour, under a finish. Not with bloom on the same shot: two glows read as one milky haze.

## When to use
Only for a clear shape against a calm ground, held as a moment.
- **A silhouette against the light** (people against a sunset or a bright window, a dancer, an athlete in the air): the defaults; the strongest use.
- **The reveal of a shape** (a product's outline on a dark set, a lamp, a box opened): dim 0.5–0.7 so the outline carries the frame, then cut to the clean picture.
- **A title or a logo of large letters on a plain ground**: the defaults; dim 0.6 or more for a night look.
- **A neon drawing** (the figure becomes only its outline, a drop in a music video, a poster beat): dim 1, colour the brand's or a neon tone.
- Words that call for it: rim light, outline glow, edge light, neon outline, contour, silhouette, backlit, glowing edges.

## Suits
- Silhouettes against a bright sky or a sunset: the outlines of people come out clean and continuous (checked on people against a sunset, a skater against a window).
- A full figure against a plain wall or a dark ground, and products with clear edges on a dark set (checked on a model against a concrete wall, a lamp and its box, players on a pitch).
- Large letters on a plain ground (checked on a poster letter 400 px high).

## Doesn't suit
- Faces seen close: lines of light run across cheeks, brows and teeth (checked on a close portrait, a bride, two interviews). Use it on the whole figure from a distance, never on a talking head.
- Crowded pictures (a mural, a street at night, shelves, a wall of posters): the light is held back where outlines crowd and what is left is broken pieces. Choose another filter.
- Bright pictures: on a light ground the warm light hardly shows and the dimming only greys the picture. Raise dim to 0.6 or more, or don't use it.
- Small type and interfaces: the letters sit too close together, so the light is held back or breaks into pieces.
- Fine branches and foliage against the sky: the big branches light, the twigs don't, and it looks patchy.

## The tired version
The tired version is every edge in the picture turned into a hard neon line on black, or rainbow outlines that cycle colour. Keep one colour, keep the outlines to the main shape (threshold 0.5 or more), and leave dim low unless the outline alone is the point.

## How long
An accent: 1–3 seconds for a reveal or a beat, a section of up to about five seconds for a neon drawing. Never the whole film.

## Parameters
- `amount` 0–1: how strong the light is; 0 leaves the picture exactly as it is.
- `threshold` 0–1: which edges light; 0.5 the main outlines, lower lights weaker edges too (and crowds sooner).
- `radius` 0.1–1: how far the halo reaches; 1 is 5% of the frame's short side.
- `colour`: the light's colour, warm white `#ffe6c7` by default; the brand's colour or a neon tone for a graphic look.
- `dim` 0–1: how much the picture darkens, most near the outlines; 0.3 the default, 1 leaves only the light.
