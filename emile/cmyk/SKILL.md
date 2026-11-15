---
name: cmyk
description: Four-colour process seen up close, cyan, magenta, yellow and black dots that never quite line up.
---

# CMYK

Mass print through a magnifying glass: the picture keeps its colours but shows what they are made of, four screens of dots at four angles, each plate a little off.

## 角色
结构 (structure): it remakes the picture as print, keeping its colours. A finish may go over it.

## 何时用
Only when the picture should be seen as something printed in thousands.
- **Blown up from an ad** (a product photo that should feel like a billboard, a catalogue, a magazine page): dots 8–12.
- **A comic beat** (a punchline, a "pow" moment, a playful aside): dots 16–24, offset 0.4.
- **"In print everywhere"** (press coverage, a montage of mentions).
- Words that call for it: CMYK, four-colour, offset print, comic, pulp, billboard, catalogue, misprint; 四色印刷、漫画网点、画报、印刷错位、套印不准.

## 适合
- Saturated, colourful pictures: every colour survives as its dots (checked on a coloured-light portrait and a product set).
- Mid-key and bright pictures; black type from 40 px prints solid.

## 不适合
- Dark pictures: the worst case of all the filters here, almost nothing of a low-key portrait is left. Don't use it there.
- A white page of interface: the screen has little to print and chews the small text.
- Text under 40 px, and coloured text of any size.

## 俗套
The tired version darkens the whole picture under a rainbow moiré. Keep dots at 8 or more so the rosette reads as dots, and offset under 0.5.

## 参数
- `amount` 0–1: 1 is the print.
- `dots` 5–40 (pixels of a 1080-pixel frame): 8–12 a fine rosette, 16–24 dots you can count.
- `offset` 0–1: how far the plates sit off each other; 0.2–0.4 reads as real print.
- `paper`: the sheet's colour, off-white.
