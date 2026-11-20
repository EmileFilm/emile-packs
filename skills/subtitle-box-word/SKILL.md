---
name: subtitle-box-word
description: White capitals; the word being said is wiped onto a red box from the left.
kind: look
---

# Box word subtitles

White capitals; the word being said is wiped onto a red box from the left.

**When**: News-style explainers, lists, numbers, short social clips. Not for calm films.

## How it is made

Using this style makes a subtitle clip at once (the engine's `subtitle` command): `example.html` with the voice's words, or words given, in it. Change the clip's look by editing its html; never write the words yourself.

- The `<script type="application/json" data-words>` block is the word table, `[{ text, at, end, space?, kw? }]` in seconds from the clip's start (`kw`: a word of a `[[keyword]]`), and the root's `data-voice` names the voice clip it follows. Both are the engine's: it writes them again when the voice is spoken again. Everything else is the look.
- The words show through `engine/subtitle.js`: `subtitle(t, ctx, { words: 'follow', chunk: [24, 10], enter: 0.16 })`. `words` is how they come (`line` a chunk at a time, `follow` the word being said marked `past` / `on` / `next`, `one` a word at a time, `single` strictly one), `chunk` the longest chunk `[Latin letters, CJK characters]`, `enter` the seconds a word takes to come in.
- Each word is a `span.w` (`kw` for a keyword) with `--in` (0–1, how far it has come in), `--said` (0–1, how far the voice is through it), `--age` (seconds since it came in) and `--i`; the CSS draws the motion from these, so every frame is a function of t.
- The words stay inside the subtitle band (`--band-left`, `--band-top`, `--band-width`, `--band-height`); sizes are shares of `--u`, the band's height. The background stays transparent.
- **Colours** are variables on `.subs`, changed there and nowhere else: `--sub-ink` (the words, `#fff`), `--sub-box` (the block or pill under the words, `#e63946`), `--sub-shadow` (the shadow, `#000`).
- Chinese and Japanese: add a CJK face after the Latin one (`'Noto Sans SC'`, `'Noto Serif SC'`, `'Noto Sans JP'`).
