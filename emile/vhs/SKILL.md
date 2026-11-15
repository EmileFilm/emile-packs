---
name: vhs
description: A tape that has been played many times, soft, colours bleeding sideways, the bottom edge tearing.
---

# VHS

What tape really does to a picture, and no more: it goes soft sideways, colour trails to the right of what it belongs to, each line lands a little off, the last lines at the bottom tear, snow sits in the darks, and now and then a band of mistracking drifts up.

## 角色
介质 (medium): the last thing before a finish; it shows whatever is under it as a tape.

## 何时用
Only when the picture is a recording of the past.
- **A memory on tape** (a childhood, a first office, the founders years ago): the defaults.
- **Found footage and behind the scenes** (a camcorder, a rehearsal, an old demo).
- **Nostalgia on purpose** (a music-video or fashion look, the eighties and nineties): bleed 0.7, noise 0.5.
- **The old way**, before a cut to the clean present.
- Words that call for it: VHS, tape, camcorder, home video, analogue, tracking, rewind, lo-fi, nostalgia; 录像带、怀旧、家庭录像、磁带、老录像、复古.

## 适合
- Footage and portraits; saturated colours (the bleed shows on them) and dark scenes (the snow shows in them). The picture is never lost (checked on every kind).

## 不适合
- Small text: everything softens sideways, body text under 28 px blurs.
- A crisp interface demo or a product beauty shot.
- The whole of a film that isn't about the past.

## 俗套
The tired version is thick bars of static, a "PLAY ▶" overlay and a rainbow glitch on every frame. Keep jitter at 0.6 or under and noise at 0.5 or under; add no overlays.

## 时长
一段：回忆、旧素材那一段 2–6 秒，然后切回干净的现在；全片只在整支片子讲过去时。

## 参数
- `amount` 0–1: how worn the tape is.
- `jitter` 0–1: how far lines wander and how hard the bottom tears.
- `bleed` 0–1: how far colour trails.
- `noise` 0–1: snow, colour blotches and dropouts.
