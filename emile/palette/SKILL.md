---
name: palette
description: The picture reduced to a handful of chosen inks, like a screen print, a blueprint or a thermal camera.
---

# Palette

Rebuilds the picture from five inks, darkest to lightest. With hard edges it is a screen print; with soft ones a thermal camera or a toned photograph. Each palette is one family of colours, chosen to sit together.

## 角色
调色 (colour) that also simplifies shape: under structure and finish.

## 何时用
Only when the film wants a designed world. Each palette says something different:
- `poster` (ink, maroon, vermilion, ochre, paper): an announcement, a campaign, a bold opinion.
- `thermal` (indigo to white-hot), soft 0.8–1: seeing what is hidden, heat, energy, what a machine detects; night scenes.
- `cyanotype` (blues of a blueprint): plans, engineering, architecture, "how it is built".
- `moss` (greens to bone): calm, nature, sustainability.
- `silver` (five greys of a darkroom print): seriousness, documentary, a classic.
- `primary` (black, blue, red, yellow, paper): play, teaching, modernist design.
- Words that call for it: posterize, screen print, limited palette, gradient map, thermal, heat map, infrared, blueprint, cyanotype; 限色、丝网印刷、海报风、色阶分离、热成像、蓝晒、蓝图.

## 适合
- Portraits and products in mid-key or bright light: a face becomes four or five flat shapes and stays a face (checked on two portraits).
- A product's screen: it stays readable, its colours snap to the palette.

## 不适合
- Dark pictures at the defaults: everything falls into the darkest ink (a low-key portrait, a night set). Set exposure 0.5–0.8: checked, a low-key face reads clearly in thermal with exposure 0.7 and soft 0.9.
- Noisy footage: the edges speckle. Raise smooth to 0.5–0.7.
- Colours that must be exact.

## 俗套
The tired versions are rainbow posterizing, the purple-and-orange sunset, and the green handheld-console joke. None is here; don't rebuild them by stacking a duotone on top.

## 时长
点缀：2–5 秒，一个设计感的时刻；热成像这类可以撑一个「看见看不见的东西」的镜头。不铺全片。

## 参数
- `amount` 0–1: 1 is five inks; 0.5 tints the picture.
- `palette`: `poster`, `thermal`, `cyanotype`, `moss`, `silver`, `primary`.
- `soft` 0–1: 0–0.2 inks meet at an edge (screen print); 0.8–1 they run into each other (thermal, toned photo).
- `smooth` 0–1: how much the picture is smoothed before it is split; 0.35 the default.
- `exposure` −1 to 1: lightens (above 0) or darkens the picture first.
