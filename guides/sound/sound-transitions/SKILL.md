---
name: sound-transitions
description: How a film's sound follows its picture's feeling, as an editor does it: look at the cut film first, find its sections and its moments (the leap, the landing, the reveal, the end), mark them on the timeline with a suggested recipe, then choose few and simple moves (a muffle released on the moment, a place's sound carried across a cut, a new music for a new section with a rise and a hit, a strong last sound, a sound match cut). Read before laying any music or sound on a film, and whenever the person asks for its sound to be "better", "more cinematic" or "like an ad".
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

**Code clips are measured for you**: `read_motions` lists everything that happens in them (a card dropping in, a stamp, a number counting up, a label turning from LATE to PAID), each with the second it starts and the second it has **landed**. Never time a code clip from the plan's moments or from frames: read its motions. The sound of a thing arriving (a hit, a pop, a tick, a chime) goes on the second it lands; a whoosh or a riser ends there. A stamp that starts at 2.20 s and lands at 2.37 s is heard at 2.37.

## 2. Who lays the moves

- **A film of shots** (footage or generated video): you lay the base (item 1 below: the beds, and the music by section when asked for music), then **mark the moments** with `mark_moments`: each moment of your sound map that a move belongs on, measured to the frame, with what happens and how it feels and the recipe you suggest (`muffle-release`, `turn`, `strong-end`, `carry-in`, `carry-out`, `match`). `strong-end` goes on the last thing that happens (the last landing, the logo), with 1.5 s or more of film after it, never on the film's last frame; `carry-in` and `carry-out` only where the beds change place (the `ambience-*` clips in `read_timeline` say each one's place). A suggestion that can't be laid is refused with why: fix it and mark again. Then stop and tell the person in a line or two which moments you marked and what you suggest: they see the moments on the timeline, move the ones you got wrong, and lay the recipes themselves. Lay a recipe yourself (`apply_recipe`) only when they ask.
- **A film made only of code clips**: every moment is known to the frame (`read_motions`), so you do it all: mark the moments and lay the recipes with `apply_recipe`, and the rest of the list by hand. Here the picture is made of small happenings, and a film with only music under them sounds unfinished: give each kind of happening its small sound, quietly (gain 0.5–0.8), the same sound for the same kind every time, all in **one `place_sounds` call** after the music:
  - things dropping or sliding in one after another (cards, rows, chips): a soft `pop-*` or `click-*` as each lands;
  - a number counting up: a `click-*` at its start, a `notify-*` or a `pop-*` when it stops;
  - a state changing (a label's words or colour: LATE to PAID): one `notify-*` as it lands;
  - a scene's whole picture changing (a headline replaced): nothing, or a short `whoosh-*` ending on it;
  - the turn and the end: the big sounds, as below.
  Not every single one: when six cards land in two seconds, all six get the pop (they are a rhythm); when four things change on one frame, one sound.

A recipe is the move below laid at once at a moment's exact frame, each sound its own clip: `muffle-release` is item 3, `turn` item 2's rise and hits (the second music still asked for with `from_seconds`), `strong-end` item 4, `carry-in` and `carry-out` item 5, `match` item 6.

## 3. The moves the picture asks for

Go down this list with your sound map. Each line the picture has, do (or, on a film of shots, mark); each it doesn't, skip. The file named on a line (in `references/`, `read_file` it) has the detail: read it before you lay that move by hand, which a recipe doesn't need.

1. **The base, for a film of shots** (footage or generated video: every film that isn't only code): its places. Look at every shot on picture track 1 (`view_frames`, a sheet of the film, then closer where a shot isn't clear) and name the place it shows, from the places `list_sounds` gives beds for (room, building, city-night, street-day, wind, rain, water, sea, car), or `none` for a studio product shot, a close-up, a graphic or a title. Then one `lay_beds` with all of them: the engine joins shots of one place, crosses the beds at a change and leaves a video's own sound alone. When unsure between two places, the quieter one (room over building, wind over street-day); when unsure whether there is a place at all, `none`. A film made only of code clips has no places: skip this.
2. **Its feeling changes at a turn** (calm to exciting, the jump, the reveal), **and each side of it lasts 8 seconds or more**: **two musics**, one per section. (A shorter side gets no music of its own: a few seconds of one music before another is heard as an intro that goes nowhere. Then one music for the whole film, and the turn is made by the riser and the hits alone.) `generate_music` (or `write_score`) for part 1 with `from_seconds` 0 and `to_seconds` the turn, and again for part 2 from the turn to the end moment; a `riser-*` ending on the turn, a `boom-*` and a `sub-drop-*` on it (the `turn` recipe; `references/music-sections.md`).
3. **A held moment before the turn** (someone at the edge, a pause): from where it starts, **muffle the music and the bed** together, opened on the turn; the riser stays unmuffled (the `muffle-release` recipe; by hand a low-pass, `references/muffle-release.md`).
4. **The last moment** (the last landing, the logo): music 2 ends on it (`to_seconds` that moment, `fade_out` 0.05) and **one strong sound** lands on it, a `boom-*` ringing out over the last 1.5–3 s (the `strong-end` recipe; `references/strong-ending.md`).
5. **A cut between places**: the next place's bed in 0.5–1.5 s early, or this one's carried on (the `carry-in` and `carry-out` recipes; `references/ambience-carry.md`).
6. **Two shots that move or look alike**: one sound across the cut (the `match` recipe; `references/match-cut.md`).

A 20–60 s film has one or two sections, one turn, one end. Every other cut gets nothing: the music carries it. If you cannot point at the picture and say why a sound is there, leave it out.

## Levels

The music is at −16 LUFS, and every catalogue sound is levelled for it by loudness. In a film that has both music and the sounds of things happening, the engine mixes the music 4 dB under them on its own (the happenings lead, the music carries) and brings the whole film back to its loudness: don't turn the music down yourself. The levels below are the sounds among themselves: at gain 1 a riser, sweep, sub-drop or interface sound sits just under the music, a hit (`boom-*`, `impact`) level with it, a bed well under it. Leave them at 1; 0.6–0.8 under a voice; 1.2–1.4 only for the one biggest moment. A sound that jumps out of the mix is the cheap version.

## Sounds that fight the music

A sound with a pitch of its own (`notify-*`, a chime, a bell, a rising tone) is a note, and over music in another key it is a wrong note: the melody and the effect fight. Over **generated** music (its key isn't known) lay only sounds without a pitch: `click-*`, `pop-*`, `whoosh-*`, `sweep-*`, `impact-*`, `boom-*`, `sub-drop-*`, and a `riser-*` only into the turn. A pitched sound is for a film with no music there, or over a score you wrote, in its key. Under a busy music keep the small sounds at 0.4–0.6 and fewer; and when the film is full of small happenings, ask the music for room: no lead melody in the prompt ("pads, bass, drums", not "lead synth, arpeggios").

## Each sound its own clip

Music 1, music 2, the riser, the hits, the impact, each bed: every one its own clip, on its own sound track, as an editor lays them, so the person can move, trim or turn down any one of them. Never a mix of several made into one file.

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
