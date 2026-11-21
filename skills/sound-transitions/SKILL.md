---
name: sound-transitions
description: How a film's sound follows its picture's feeling, as an editor does it: look at the cut film first, find its sections and its moments (the leap, the landing, the reveal, the end), then choose few and simple moves (a muffle released on the moment, a place's sound carried across a cut, a new music for a new section with a rise and a hit, a strong last sound, a sound match cut). Read before laying any music or sound on a film, and whenever the person asks for its sound to be "better", "more cinematic" or "like an ad".
kind: tool
---

# Sound follows the picture

The sound of a good edit is not effects. It is the picture's feeling made audible: the breath held before a jump, the world rushing back when it lands, a calm place giving way to an exciting one, a last moment that rings. None of it is decided before the picture is cut, and none of it is decided by the cuts alone: by what happens in them.

## 1. Picture first

Never lay music or sound on a film whose picture isn't cut. Then look at it: `view_frames` of `"film"` over the whole length (a sheet), then closer (`from_seconds`/`to_seconds`, more frames) around every moment that matters, until you can say to the frame where each happens. Write it down for yourself as a sound map:

| Part | Seconds | What we see | Feeling |
|---|---|---|---|
| the canyon | 0–12.2 | green walls, a cave's light, a pool | calm, mysterious |
| at the edge | 12.2–14.0 | a woman, then a man leaning over the drop | holding the breath |
| the fall | 14.0–15.35 | he steps off, falls | suspense |
| the landing | 15.35 | he hits the water | release |
| the second jump | 15.35–20.8 | ripples, the next one leaps, lands | joy, energy |
| the end | 20.8–23 | spray settling | done |

Measure the moments, don't guess: a body touching the water is one frame. A sound a few frames off the picture feels wrong even when nobody can say why.

## 2. The moves the picture asks for

Go down this list with your sound map. Each line the picture has, do; each it doesn't, skip. The Skill named on each line has the detail.

1. **A film with no sound of its own** (most stock and generated footage): a bed that matches what we see under all of it, `bed-*` at gain 1, beds overlapping 0.5 s with 0.5 s fades (`sound-ambience-carry`).
2. **Its feeling changes at a turn** (calm to exciting, the jump, the reveal): **two musics**, one per section. `generate_music` (or `write_score`) for part 1 with `from_seconds` 0 and `to_seconds` the turn, and again for part 2 from the turn to the end moment; a `riser-*` ending on the turn, a `boom-*` and a `sub-drop-*` on it (`sound-music-sections`).
3. **A held moment before the turn** (someone at the edge, a pause): from where it starts, **muffle the music and the bed** together with `timeline_edit` `sound` `lowpass` (`[[start, 20000], [start + 1.5, 500], [turn, 450]]` on music 1; on a bed that plays through, open it again at the turn); the riser stays unmuffled (`sound-muffle-release`).
4. **The last moment** (the last landing, the logo): music 2 ends on it (`to_seconds` that moment, `fade_out` 0.05) and **one strong sound** lands on it, a `boom-*` ringing out over the last 1.5–3 s (`sound-strong-ending`).
5. **A cut between places**: the next place's bed in 0.5–1.5 s early, or this one's carried on (`sound-ambience-carry`).
6. **Two shots that move or look alike**: one sound across the cut (`sound-match-cut`).

A 20–60 s film has one or two sections, one turn, one end. Every other cut gets nothing: the music carries it. If you cannot point at the picture and say why a sound is there, leave it out.

## Levels

The music is at −16 LUFS. The transition sounds (riser, swell, sweep, sub-drop, boom, bed) are levelled for it: leave them at gain 1 (0.6–0.8 under a voice). The older interface sounds (`click`, `pop`, `whoosh`, `rise`, `drop`, `impact`, `notify`, `ambience-*`) peak at −1 dBFS: give them 0.2–0.4. A sound that jumps out of the mix is the cheap version.

## Placing by the moment

Every catalogue sound has a `cut`, the moment in it that belongs on the picture's moment (a riser's end, a boom's attack, a sweep's peak). `place_sound` lays that on `at_seconds`: give it the moment's time from your sound map.

## With a voice

No rise, hit or muffle over spoken words: put the turn where nobody speaks, or leave it.

## The tired version

- Sounds chosen before the picture was looked at.
- A whoosh or a riser on every cut.
- One music under everything, start to end, ending in a fade.
- A hit on a cut where nothing happens.
- Everything at full level.
