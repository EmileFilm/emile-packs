---
name: crt
description: A picture on a glass tube, scan lines, phosphor stripes, a gently curved face.
---

# CRT

Shows the picture on a machine of another time: a tube with a slightly bulging face, lines drawn by a beam, stripes of red, green and blue phosphor, and a faint band of hum drifting up.

## 角色
介质 (medium): the last thing before a finish; it shows whatever is under it on a tube.

## 何时用
Only when the picture is meant to be on a screen inside the story.
- **Then and now** (how it was done in the nineties, before the clean present): the "then" section.
- **A feed** (a security camera, a control room, a monitor wall, a broadcast).
- **Games and early computing** (an arcade, a console, a terminal session).
- Words that call for it: CRT, tube television, old monitor, scan lines, arcade, nineties, terminal, surveillance, broadcast; 显像管、老电视、扫描线、复古、街机、监控画面.

## 适合
- Every kind of picture checked: dark and saturated ones best. Headlines and large numbers stay readable.
- amount under 1 is a flatter, cleaner tube (less bulge, fainter lines).

## 不适合
- Small text: 24 px type softens between the lines.
- Fine detail that must stay crisp (a product beauty shot).
- Films that will be watched very small: the phosphor stripes can shimmer when the player scales them. Keep mask at 0.25 or under, or 0.

## 俗套
The tired version is a heavy fish-eye bulge, thick black bars, a green tint and a blinking "REC". Keep curvature at 0.4 or under and scanlines at 0.7 or under; add no overlays.

## 参数
- `amount` 0–1: how much tube.
- `curvature` 0–1: the bulge of the face; 0.3 the default.
- `scanlines` 0–1: how dark the gaps between lines are.
- `mask` 0–1: the phosphor stripes.
