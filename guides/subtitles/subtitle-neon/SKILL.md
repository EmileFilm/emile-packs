---
name: subtitle-neon
description: Spaced capitals in dim teal; the word being said and the keywords light up as neon, flickering on.
kind: look
tags: glow, karaoke
---

# Neon subtitles

Spaced capitals in dim teal; the word being said and the keywords light up as neon, flickering on.

**When**: Night scenes, music, gaming, tech launches on a dark picture. Not on a light picture: neon needs the dark.

## How it is made

Using this style makes a subtitle clip at once (the engine's `subtitle` command): `example.html` with the voice's words, or words given, in it. Change the clip's look by editing its html; never write the words yourself.

- The `<script type="application/json" data-words>` block is the word table, `[{ text, at, end, space?, kw? }]` in seconds from the clip's start (`kw`: a word of a `[[keyword]]`), and the root's `data-voice` names the voice clip it follows. Both are the engine's: it writes them again when the voice is spoken again. Everything else is the look.
- The words show through `engine/subtitle.js`: `subtitle(t, ctx, { words: 'follow', chunk: [26, 11], enter: 0.24 })`. `words` is how they come (`line` a chunk at a time, `follow` the word being said marked `past` / `on` / `next`, `one` a word at a time, `single` strictly one), `chunk` the longest chunk `[Latin letters, CJK characters]`, `enter` the seconds a word takes to come in.
- Each word is a `span.w` (`kw` for a keyword) with `--in` (0–1, how far it has come in), `--said` (0–1, how far the voice is through it), `--age` (seconds since it came in) and `--i`; the CSS draws the motion from these, so every frame is a function of t.
- The words stay inside the subtitle band (`--band-left`, `--band-top`, `--band-width`, `--band-height`); sizes are shares of `--u`, the band's height. The background stays transparent.
- **Colours** are variables on `.subs`, changed there and nowhere else: `--sub-ink` (the words, `#e8feff`), `--sub-accent` (the word being said or a keyword, `#3ff0ff`), `--sub-dim` (words not said yet, `#2f7f86`).
- Chinese and Japanese: add a CJK face after the Latin one (`'Noto Sans SC'`, `'Noto Serif SC'`, `'Noto Sans JP'`).
