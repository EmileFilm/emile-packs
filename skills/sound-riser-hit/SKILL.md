---
name: sound-riser-hit
description: The turn of a film made to land: a riser or a swell building into the cut, a breath of near-silence just before it, then a hit and a sub-drop on it with the music re-entering. Timings, sounds, levels, and how to do it. Read for the reveal, the product's first appearance, the title, the drop.
kind: tool
---

# Riser into a hit: build, breathe, land

The biggest moment of the film is pushed up to and then let go: a sound builds for a few seconds, everything drops out for a breath, and the cut lands with a hit and a low boom while the music comes back in full. The silence is what makes it heavy: after it, the same hit feels far louder.

## When

- Once a film, maybe twice: the turn (the product revealed, the logo, the title, "introducing…"), and perhaps the close.
- Not over words; not on an ordinary cut; not twice in ten seconds.

## The parts

| Part | Sound | Where | gain in Émile |
|---|---|---|---|
| Build | a riser (`riser-*`), or a swell (`swell-*`) for a softer, drawn-in build | ending on the cut, 1–4 s long | 0.4–0.6 |
| Breath | nothing: the riser and the music stop | the last 0.15–0.4 s before the cut | — |
| Hit | an impact (`impact-*`) | on the cut | 0.6–0.9 |
| Weight | a sub-drop (`sub-drop-*`) | on the cut | 0.7–1.0 |
| Music | back in, full | on the cut (a downbeat) | as it was |

Length of the build: about the length of the section before the turn, at most 4 s; 1–2 s in a fast film. A swell instead of a riser for a calm or premium film. The breath is shorter in a fast film (0.15 s), longer in a slow one (0.4 s); in a film whose music has a strong beat, make it one beat or half a beat.

## In Émile

With the turn at `T` and a breath of `B`:

1. `place_sound` the riser at `T` (its end lands on `T`), then `trim` it by `B` (its length minus `B`), so it stops at `T − B`; gain 0.4–0.6, `fade_out` 0.03.
2. `place_sound` an impact at `T` and a sub-drop at `T`; gains as above.
3. The music: `split` the music clip at `T − B` and at `T`, and `remove` the piece between, so it stops for the breath and comes back on the cut. Give the piece before a `fade_out` of 0.05 so it doesn't click. When the score is yours (`write_score`), write the rest into it instead: no notes in the breath, the hit's chord on `T`.
4. When the person's voice speaks over `T − 4` to `T + 1`, move the turn or leave the build out.

## With ffmpeg

Riser 2 s ending on 6.0 s with a 0.25 s breath, an impact and a sub-drop on 6.0 s, the music muted from 5.75 to 6.0:

```bash
ffmpeg -i music.wav -i riser.wav -i impact.wav -i subdrop.wav -filter_complex \
  "[0]volume=enable='between(t,5.75,6.0)':volume=0[m];\
   [1]atrim=0:1.75,afade=t=out:st=1.72:d=0.03,adelay=4000|4000,volume=-6dB[r];\
   [2]adelay=6000|6000,volume=-2dB[i];[3]adelay=6000|6000[s];\
   [m][r][i][s]amix=inputs=4:normalize=0,alimiter=limit=0.89" mix.wav
```

## The tired version

- A riser before every scene; a hit on every cut.
- The riser running straight into the hit with no breath, so nothing lands.
- A hit with no picture change under it.
- Every part at full level: the music, the riser and the hit all shouting at once.
