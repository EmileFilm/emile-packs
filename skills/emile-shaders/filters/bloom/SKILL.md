---
name: bloom
description: Light spills from the brightest points into the dark around them, with the warm edge film gives it.
---

# Bloom

Makes light behave like light: bright type, lamps and highlights bleed a little into the dark beside them, with a warm edge like halation on film. It only works where light is scarce; on a bright picture it does nothing, on purpose.

## Role
Optics: over the picture and its colour, under a finish. Grain over it suits it.

## When to use
Only when a dark picture should glow.
- **Night and dark-mode heroes** (a dark product shot, a dark interface with bright type and accents): the defaults.
- **Switching on** (a screen waking, a light coming up, the moment something starts working).
- **A dream or a memory** in a dark setting: warmth 0.6–0.8, radius 0.8–1.
- Words that call for it: bloom, glow, halation, light bleed, soft light, luminous, night.

## Suits
- Dark pictures with bright points: white type, small lights, thin bright lines, highlights on dark products (checked on a night set and a dark panel).

## Doesn't suit
- Bright pictures: nothing happens (checked: a bright product set and a white page of interface come out unchanged). Don't add it there expecting a glow.
- A wide, soft glow that fills the frame: the radius stops at about 2% of the frame's short side, because a filter draws in one pass.
- Fine detail one or two pixels wide looked at closely: its glow is a little uneven.

## The tired version
The tired version is a milky glow over everything that washes the contrast out, or lens flares. Keep threshold at 0.6 or more and leave the dark parts dark.

## How long
As long as the shot: the dark shot with points of light, for its whole length. It is restrained and hides nothing.

## Parameters
- `amount` 0–1: how much light spills.
- `threshold` 0.3–0.95: how bright something must be to spill; 0.7 the default.
- `radius` 0.1–1: how far; 1 is about 2% of the frame's short side.
- `warmth` 0–1: 0 the light's own colour, 1 the red-orange of halation; 0.35 the default.
