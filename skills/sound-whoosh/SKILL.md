---
name: sound-whoosh
description: A whoosh on a moving transition (push, wipe, zoom, whip pan, something flying across the frame): which length, where its peak goes, how loud, and when to leave it out. Read before laying a whoosh or a sweep.
kind: tool
---

# Whoosh: the sound of the move

A whoosh is air moved by something fast. It belongs to a transition that moves (a push, a wipe, a zoom, a whip pan) or to something crossing the frame, and its loudest moment is the move's fastest: the seam.

## When

- A push, wipe or zoom transition, or a whip pan cut.
- A title, a card or a product flying in or out.
- Not on a dissolve (nothing moves), not on a plain cut, and not on a move the music already hits.

## Which one

| The move | Sound | Length |
|---|---|---|
| A flick: a quick swipe, a card snapping in | `whoosh` (short), `sweep-08` | 0.15–0.7 s |
| A push or wipe of 0.4–0.8 s | `sweep-01`, `sweep-02`, `sweep-06`, `sweep-03` | 0.8–1.2 s |
| A slow zoom, a big camera move | `sweep-04`, `sweep-05` | 1.5–2 s |

The sound should be a little longer than the move: it starts before the picture does and trails after. A low, broad whoosh reads as big and heavy; a high, narrow one as fast and light: match what moves.

## Timing

The sound's peak on the seam (the middle of the transition), or 1–2 frames before it: a peak slightly early reads as anticipation, exactly on it as precision. Tens of milliseconds matter; never later than the seam.

## In Émile

`place_sound` the sweep with `at_seconds` = the seam: its cut is its peak, so the peak lands there. Then `sound` on the clip: gain 0.3–0.5 under music (0.6 with no music), no fades needed.

## With ffmpeg

A sweep whose peak is at 0.725 s in its file, on a seam at 6.0 s (start 5.275 s), at −8 dB:

```bash
ffmpeg -i film.mp4 -i sweep.wav -filter_complex \
  "[1]adelay=5275|5275,volume=-8dB[s];[0:a][s]amix=inputs=2:normalize=0[a]" -map 0:v -map "[a]" -c:v copy out.mp4
```

## The tired version

- A whoosh on every cut, every one the same.
- The peak after the move, so the sound trails the picture.
- A big cinematic whoosh under a small UI swipe.
