---
name: bloom
description: Light spills from the brightest points into the dark around them, with the warm edge film gives it.
---

# Bloom

Lets the lights in a dark picture glow the way they do through a lens and on film: bright and close around each light, fading smoothly far from it, the dark between them left dark. Coloured lights keep their colour; warmth adds the red-orange edge of film halation.

## Role
Optics: over the picture and its colour, under a finish. Grain over it suits it.

## When to use
Only when a dark picture has lights that should glow.
- **Night and dark-mode heroes** (a street at night, a dark product shot with lit edges, a dark interface with bright type): the defaults.
- **Switching on** (a lamp coming up, a screen waking, the moment something starts working): amount from 0 to 1 over half a second.
- **A dream or a memory** in a dark setting: warmth 0.6–0.8, radius 0.8–1.
- **Neon and stage lights** (a club, a concert, a sign): the defaults; coloured lights glow in their own colour.
- Words that call for it: bloom, glow, halation, light bleed, soft light, luminous, night, neon.

## Suits
- Dark pictures with small bright lights: street lights, signs, lamps, headlights, a lit screen in a dark room (checked on night streets, an event hall, gaming rooms, a lamp reveal, a dark office: the light spills and the dark stays dark).
- Coloured lights (neon, a red sign, a teal shop light): brightness is read from the brightest channel, so they glow as much as white ones.

## Doesn't suit
- Bright pictures: nothing happens, by design (checked: product shots on light backdrops, a pastel flat lay, white type pages, a plated dish all come out unchanged). Don't add it there expecting a glow.
- Pictures lit by diffuse light with no points of light (a stage washed in blue haze, a dark bottle with no highlight): there is nothing to spill.
- A daylight room with a white screen in it: the screen glows like a lamp, which reads as a dream, not an office. Use it there only for that.

## The tired version
The tired version is a milky glow over everything that washes the contrast out, or lens flares and star streaks. Keep threshold at 0.75 or more, leave the dark parts dark, and never add flares: this is a glow, not a lens trick.

## How long
As long as the shot: the dark shot with points of light, for its whole length. It is restrained and hides nothing.

## Parameters
- `amount` 0–1: how much light spills; 0 leaves the picture exactly as it is.
- `threshold` 0.5–0.95: how bright a light must be, and it must also stand out from what is around it; 0.8 the default.
- `radius` 0.1–1: how far the glow reaches; 1 is 10% of the frame's short side, 0.5 the default.
- `warmth` 0–1: 0 the light's own colour, 1 the red-orange of halation; 0.35 the default.
