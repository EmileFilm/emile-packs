---
name: sound-l-cut
description: An L-cut, a shot's sound carried on into the next picture (audio tail, post-lap): what it is for, how long, and how to do it on Émile's timeline and with ffmpeg. Read when a moment's sound should linger past its cut.
kind: tool
---

# L-cut: let it ring on

The picture cuts, the sound stays: a line finishes over the listener's face, the crowd's cheer goes on over the product shot, a chord rings under the next scene. The moment is kept a little longer than the picture, so the cut feels like a thought continuing, not an interruption. On a timeline the sound runs on to the right of its picture: an L.

## When

- The end of a sentence, so we see who it lands on.
- A sound that matters to the story (a click, a laugh, an engine) running into what it caused.
- Out of an emotional moment into a quiet one.
- Not into a shot with its own words or a strong sound of its own; not under a voice-over.

## How long

0.5–2 s, ending with a fade of at least half that. The sound should end on something (the last word, a breath), never in the middle of a syllable.

## In Émile

The shot's own sound is part of its clip, so carrying it past the cut takes it off as a sound clip (`timeline_edit` `detach_sound`): **ask the person first**. With a yes, at the seam `T`, tail `L`:

1. `detach_sound` the shot: its sound is a sound clip over the same frames.
2. `trim` that sound clip to its length plus `L` (only as far as its file goes on: read_timeline gives the file's length and `in`).
3. `sound` on it: `fade_out` = `L` (at least half of it).
4. `sound` on the next shot's own sound: `fade_in` over `L` so the two don't meet at full level.

## With ffmpeg

A's sound runs from 0 to 6.0 s in its picture, carried on to 7.2 s:

```bash
ffmpeg -i a.wav -i b.wav -filter_complex \
  "[0]atrim=0:7.2,afade=t=out:st=6.4:d=0.8[a];[1]adelay=6000|6000,afade=t=in:st=6.0:d=1.2[b];[a][b]amix=inputs=2:normalize=0" mix.wav
```

## The tired version

- A tail cut off mid-word.
- Two voices over each other because the tail runs under the next line.
