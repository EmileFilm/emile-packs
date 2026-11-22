---
name: sound-muffle-release
description: The held breath before an action and the release on it: everything muffled (a low-pass closing) while someone stands at the edge, and the sound opening, full and bright, on the jump, the landing, the press, the reveal. When, how far, how fast, and how to do it with Émile's low-pass. Read when the picture holds still before something happens.
kind: tool
---

# Muffle, then release

Before a diver jumps, the world goes quiet and dull, as if heard from inside a held breath; on the jump (or the splash) it all comes back at once, brighter than before. The same works for the finger over a button, the last second of a countdown, a product under a cloth. It needs no new sound: the music and the place's sound you have, muffled and opened.

## When

- A visible held moment, 1–4 s long, before a clear action: standing at the edge, the run-up, the pause before a reveal.
- Once in a film, at its turn. Twice and it stops meaning anything.

## Where it opens

On the moment that is the release in the picture, found to the frame:
- the action itself (the feet leave the edge, the button goes down) when the action is the point;
- or its result (the body hits the water, the product appears) when the moment in between is the suspense. With a fall in between, open on the landing: the fall stays held.

## How

| | |
|---|---|
| Starts closing | where the held moment begins (the cut to the edge) |
| Closed | over 1–2 s to 400–600 Hz: dull, as if under water or through a wall; never below 300 Hz (it disappears) |
| Held | closed until the release |
| Opens | at once on the release (within 1–2 frames), to full |

Muffle what was playing: the music, the place's bed. Not a riser laid on top for the build (it should cut through the muffle) and never a voice. On the release, make it bigger than before: the new section's music (`sound-music-sections`) and a hit come in on that frame.

## In Émile

`timeline_edit` `sound` with `lowpass`, the points in the film's seconds, within the clip. With the held moment from `A`, closed by `B`, released at `R`:

- the music clip that plays up to `R`: `lowpass` `[[A, 20000], [B, 500], [R, 450]]`; it ends at `R` (the next music starts there);
- a bed that plays on through `R`: `[[A, 20000], [B, 500], [R − 0.03, 500], [R + 0.03, 20000]]`, so it opens on `R`;
- a video whose own sound plays through it: the same on the video.

`"[]"` takes a low-pass off. Check it: `view_frames` won't show it; read the timeline back.

## With ffmpeg

Music muffled from 12.2 s (to 500 Hz by 14.0 s), opened at 15.35 s:

```bash
ffmpeg -i music.wav -af "asendcmd=c='12.2 lowpass f 20000;12.6 lowpass f 6000;13.0 lowpass f 2500;13.5 lowpass f 1100;14.0 lowpass f 500;15.35 lowpass f 20000',lowpass=f=20000" out.wav
```

## The tired version

- Muffled for so long the audience thinks the sound broke.
- Opening a beat after the action, so the release lags the picture.
- Muffling with nothing bigger to open into.
