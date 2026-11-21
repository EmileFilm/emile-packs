---
name: sound-transitions
description: How a film's sound carries it across a cut or a transition, and which of the seven ways suits each one (J-cut, L-cut, ambience crossfade, whoosh, riser into a hit, sound match cut, music handoff). Read before laying any sound on a cut, and when the person asks for transitions "with sound", "more cinematic" or "like an ad".
kind: tool
---

# Sound across a cut

In a professional edit the cut is felt more through the sound than seen: the next place is heard before it is shown, a moment rings on after the picture has moved on, a reveal is pushed up to, held for a breath of silence, and then lands. Done well nobody notices it; the film just flows and its big moments hit.

## First: most cuts get nothing

A sound on every cut is the cheap version. In a 30–60 s film, design two to four transitions: the turn (the reveal, the product, the title) and one or two scene changes. Every other cut is a plain cut, carried by the music.

## Which one

| The cut | Use | Skill |
|---|---|---|
| Into a new place whose own sound we have (street, room, nature) | Hear it before you see it | `sound-j-cut` |
| Out of a moment that should linger (a line, a reaction, a sound that matters) | Let it ring into the next shot | `sound-l-cut` |
| A dissolve, or any soft change between two places with sound | Cross their beds, never a hole | `sound-ambience-crossfade` |
| A push, wipe, zoom, whip pan, a fast move across the frame | A whoosh peaking on the seam | `sound-whoosh` |
| The turn: the reveal, the product appearing, the title | Build, a breath of silence, then land | `sound-riser-hit` |
| Two shots that share a shape, a motion or a sound | One sound becomes the other | `sound-match-cut` |
| The music has to change: a new section, a new track, the end | Change it on a downbeat, end on a hit | `sound-music-handoff` |

Read the one you use; each gives its timings, its levels and how to do it.

## With the music

- Lay the designed transitions where the music's beats are (`write_score` and `generate_music` give them): a sound that lands off the beat fights the music.
- When the music itself hits on the cut (a downbeat, a drum fill landing), a whoosh or a hit on top is one too many: let the music do it, or use a lighter sound.
- The riser into the turn and the music's build are one gesture: thin the music just before the cut (`sound-riser-hit`).

## With a voice

- Never a whoosh, a riser or a hit over spoken words. Move the transition to the gap between sentences, or leave it.
- Effects are lowered under a voice automatically; still keep them under it: the voice always wins.

## Levels in Émile

`place_sound` returns the clip; set its volume with `timeline_edit` `sound` (gain 1 is as it is). The catalogue's sounds peak at −1 dBFS, much louder than music at −16 LUFS, so almost every effect needs bringing down:

| Sound | gain |
|---|---|
| sweep, whoosh under music | 0.3–0.5 |
| riser | 0.4–0.6 |
| impact on the turn | 0.6–0.9 |
| sub-drop | 0.7–1.0 (it is mostly felt, not heard) |
| swell | 0.4–0.6 |

## Placing by the cut

Every catalogue sound has a `cut`: the moment of it that belongs on the picture's change (a riser's end, a swell's end, a sweep's peak, a sub-drop's start, a hit's attack). `place_sound` lays that moment on `at_seconds`: give it the seam's time, never work out the start yourself.

## The tired version

- A whoosh on every cut, a riser before every scene.
- A hit on a cut nothing happens on.
- Sound effects louder than the music, or over words.
- The film's own sound cut dead at every cut, so each shot starts in a vacuum.
- The music faded out at the end instead of ending on a hit.
