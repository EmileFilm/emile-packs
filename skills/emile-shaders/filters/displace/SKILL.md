---
name: displace
description: Bands of the picture slip sideways, something has shifted, and holds there.
---

# Displace

A break in the picture: a few bands slip sideways, their colours parting a little, and the arrangement holds until the next beat. Most of the frame stays where it was, so the picture is still whole.

## Role
Optics: over the picture and its colour, under a finish.

## When to use
Only when something in the story breaks, slips or hits.
- **The problem** (the outage, the error, the mess before the product arrives): half a second to a second and a half, then a clean cut to the answer.
- **A hit on the music** (a drop, a hard cut): speed 0.5–1 for the bar, shift 0.6.
- **A breach, a failure, a system out of control** (security, a crashed process, a wrong answer).
- **A still poster** (a title with the picture slipped once and held): speed 0.
- Words that call for it: glitch, slice, slip, displaced, corrupted, broken signal, jitter, tension, impact.

## Suits
- Portraits, products and type alike: the picture stays whole under it (checked on every kind of picture).
- Short spans, two seconds or less, placed on a beat.

## Doesn't suit
- Long spans: it tires and stops meaning anything.
- Calm, trust and reassurance (money, health, safety).
- Words that must be read during the hit: a slipped band cuts through letters.

## The tired version
The tired version is the whole frame split into red and cyan and flickering every frame, with scan lines on top. Keep speed at 0.5 or under unless the music hits, split at 0.3 or under, slices at 0.6 or under.

## How long
An accent: 0.3–1.5 seconds, on the beat or the moment something goes wrong. Past two seconds it means nothing.

## Parameters
- `amount` 0–1: scales how far bands slip.
- `slices` 0–1: how much of the picture slips; 0.5 the default.
- `shift` 0–1: how far; 0.5 slips a thin band about a twentieth of the width.
- `split` 0–1: how far red and blue part on a slipped band.
- `speed` 0–1: 0 holds one arrangement, 0.2 changes about every 1.7 s, 1 three times a second. Each change takes three frames, then holds.
