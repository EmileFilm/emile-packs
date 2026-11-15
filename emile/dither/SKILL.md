---
name: dither
description: A one-bit picture, two colours and a pattern of pixels doing the work of every grey.
---

# Dither

The picture as a machine first showed pictures: square pixels, each one ink or paper, greys made of pattern. With the grain pattern it becomes a stencil or a photocopy instead.

## 角色
结构 (structure): it remakes the picture in two colours. Nothing over it: a finish would blur the pixels.

## 何时用
Only when the film speaks about machines, data, or a rough hand-made copy.
- **Under the hood** (how the software thinks, a boot sequence, a terminal moment, a nod to early computers): pattern ordered, size 3.
- **The machine's view** (data, compression, what a model sees): a section in ordered dither between clean ones.
- **A stencil or a photocopy** (a street poster, a manifesto, a wanted notice): pattern grain, size 2, on a portrait.
- Words that call for it: dither, 1-bit, bitmap, pixel, early Macintosh, e-ink, terminal, stencil, photocopy, xerox; 抖动、像素风、一位色、复古电脑、墨水屏、模板喷漆、复印.

## 适合
- Portraits and products in mid-key or bright light (checked: the face holds in both patterns).
- Headlines: black type stays solid.
- Held shots and slow moves.

## 不适合
- Low-key pictures: the darks fall into solid ink (a low-key portrait keeps little).
- Text in a mid-tone, and small text.
- Fast or textured motion: the pattern stays still while the picture moves under it, and it crawls.
- Long stretches.

## 俗套
The tired version is a one-pixel dither that looks like a broken GIF, or a green "Matrix" tint. Keep size at 2 or more, and ink and paper off-black and off-white or the brand's dark and light.

## 时长
点缀：1–4 秒，「机器的视角」那一下；夹在干净的镜头之间才有意思。不铺长段。

## 参数
- `amount` 0–1: 1 is one bit.
- `size` 1–12 (pixels of a 1080-pixel frame): 2–3 fine, 4–6 chunky.
- `pattern`: `ordered` (the Bayer weave) or `grain` (a random edge after a hard contrast).
- `ink`, `paper`: the two colours; swap them for light on dark.
