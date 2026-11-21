---
name: sound-match-cut
description: A sound match cut, one sound becoming another across a cut because the two shots move or look alike (a splash into the pop of a bottle, a ball's bounce into a heartbeat, a spinning wheel into a fan): an advanced edit that only works when it comes from the picture. How to find a pair in the film, cut it and voice it in Émile. Read when two shots share a motion, a rhythm or a shape.
kind: tool
---

# Sound match cut

Two shots are joined by a sound that belongs to both: a diver hits the water and the splash becomes the fizz of a drink poured; the click of a pen becomes a camera's shutter; a door slams and becomes a drum hit. The cut becomes an idea: these two are alike. It is one of the most admired moves an editor has, and it only works when the picture gives it.

## Finding a pair

Look at the cut film (`view_frames`, close around each cut) for two shots, next to each other or that could be, that share:
- a motion: falling, spinning, pouring, tapping, closing;
- a rhythm: steps, a heartbeat, waves;
- a shape and a moment: a splash and a burst, a ball and a sun.

None in the film: don't force one. A match between things that have nothing else in common is a pun.

## How

1. Cut on the sound's moment: the first shot ends on its action (the hit, the tap) and the second starts on its matching one, or a few frames later. Re-cut the picture when needed so the two actions meet exactly at the cut.
2. One sound across the cut: the first shot's sound ends as the second's starts, crossing over 0.1–0.3 s, so the ear hears one sound changing.
3. When neither shot has the sound, lend one: the same sound (a `boom-*`, a `pop`, a `sweep-*`) on both actions, the second a little louder, or two related ones (a splash bed into a fizz).
4. For a moment, lower the music (gain 0.5 for a second around the cut) so the match is heard.

## In Émile

- The cut: `timeline_edit` `split`, `trim`, `move` until the two actions meet at the cut.
- The sounds: `place_sound` on each action's moment, or the two shots' own sounds with `fade_out` 0.1 on the first and `fade_in` 0.1 on the second.
- The music around it: `split` it around the cut and set the piece's gain, or leave the music out of that second.

## The tired version

- A match nobody hears, buried in music.
- Matches on every cut.
