---
name: chromatic-aberration
description: A lens that splits light at its edges, colours part towards the corners, the centre stays sharp.
---

# Chromatic aberration

Two different things under one name. `lens` is what real glass does: nothing in the middle of the frame, colours fanning out a little towards the corners. `shift` parts the whole frame one way, like a prism held in front of it.

## 角色
光学 (optics): over the picture and its colour, under a finish.

## 何时用
Only for one of two reasons.
- **To make a clean picture feel photographed** (drawn, rendered or generated clips that look too perfect): mode lens, strength 0.2–0.35, for as long as the shot lasts.
- **A moment of overload** (an impact, an error, vertigo, too much at once): mode shift, strength 0.5–0.8, for a third of a second to a second on the beat.
- Words that call for it: chromatic aberration, lens fringe, colour fringing, RGB split, prism, dispersion; 色散、色差、镜头感、RGB 分离、棱镜、重影.

## 适合
- lens: every kind of picture checked; the centre is untouched, so a face or a product in the middle stays sharp.
- shift: bold shapes and big type for a short hit.

## 不适合
- shift over words that must be read: letters triple.
- shift for a whole scene: it stops being a moment.
- lens at high strength on an interface with small text near the corners.

## 俗套
The tired version is a fat red-and-cyan split over the whole frame, all the time. Default to lens; keep strength at 0.4 or under for anything longer than a second.

## 参数
- `amount` 0–1: scales how far the colours part.
- `strength` 0–1: 0.3 the default.
- `mode`: `lens` (from the centre outward) or `shift` (the whole frame one way).
- `angle` 0–360: the direction of shift; 0 sideways, 90 upward.
