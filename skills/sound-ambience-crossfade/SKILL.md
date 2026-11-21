---
name: sound-ambience-crossfade
description: Crossing two places' sound beds over a dissolve or a soft cut so the film never drops into silence: lengths, curves, and filling a gap with a bed. Read when a dissolve joins two shots with sound, or a cut leaves a hole in the sound.
kind: tool
---

# Ambience crossfade: never a hole

Every place has a sound, even a quiet one (a room's hum, air, distant traffic). Cut it dead and the shot after starts in a vacuum; the ear notices before the eye does. Between two places the beds cross: one goes as the other comes, over the length of the change.

## When

- Every dissolve between two shots with sound.
- Any cut where the sound would otherwise stop and start: two takes of different rooms, a shot without sound next to one with.
- Under a title card or black between two scenes: a bed carries over it, so the film doesn't drop out.

## How

- Over a dissolve: the beds cross over exactly the dissolve's length, equal power (each at about 70 % at the middle), so the level doesn't dip.
- At a cut: a short cross, 0.1–0.3 s, centred on the cut, or a J-cut (`sound-j-cut`) when the new place should be announced.
- A shot with no sound of its own, or black: lay an ambience bed under it (`list_sounds`, tag ambience) at gain 0.3–0.5, fading in and out over 0.5 s.
- A bed fills the gaps; it is not laid under shots that already have their own sound (two beds add up to noise).

## In Émile

- A transition between two videos already crosses their own sounds over the transition's length: nothing to do but check both have `use` keep.
- Black, a title, a code clip with no sound between two shots: `place_sound` an ambience on the moment it starts (an ambience's cut is 0: it starts where it is laid), `trim` it to the gap plus 0.5 s on each side, `sound` with `fade_in` and `fade_out` 0.5 and gain 0.3–0.5.

## With ffmpeg

Two beds crossing over a 1 s dissolve at 6.0 s (the first ends at 6.5, the second starts at 5.5):

```bash
ffmpeg -i a.wav -i b.wav -filter_complex "[0][1]acrossfade=d=1:c1=qsin:c2=qsin" mix.wav
```

## The tired version

- Room tone under everything, so the whole film hisses.
- A crossfade so long both places are heard at once for seconds.
