---
name: sound-music-sections
description: More than one music in a film, one for each of its sections, handed over where the picture's feeling changes: the first music rising (a riser), a hit and an impact on the change, the next music starting with them. Where the change goes, how the two overlap, which sounds, and how in Émile. Read when a film's feeling changes partway (calm to exciting, problem to solution, story to call to action).
kind: tool
---

# A music for each section

One music under a whole film flattens it. Editors give each section its own: a piano for the quiet opening, a driving track for the action, and make the change an event: the first music builds, a riser climbs, and on the turn a hit lands as the new music starts at full.

## Where

The change goes on the picture's turn, found to the frame (the landing, the reveal, the logo), never on an ordinary cut. Two sections, at most three, in a short film.

## The parts of a hand-over

| Part | What | Where | In Émile |
|---|---|---|---|
| Music 1 | the section before | up to the turn, ending on it (muffled before it, `sound-muffle-release`, or full) | `generate_music` or `write_score` with `from_seconds` 0, `to_seconds` the turn |
| Riser | builds into the turn: `riser-*` (1–4 s), or `swell-*` for a calm film | ending on the turn | `place_sound` at the turn |
| Hits | the change lands: `boom-*` (`boom-02` big, `boom-03` tight, `boom-05` soft) | on the turn | `place_sound` at the turn |
| Impact | weight under the hit: `sub-drop-*` | on the turn | `place_sound` at the turn |
| Music 2 | the new section, starting at full | from the turn | `generate_music` / `write_score` with `from_seconds` the turn |

The two musics may overlap by a few frames to a second: the first fading out under the second (their own fades; the part's music comes with a 0.05 s fade in and 0.5 s fade out, change them with `timeline_edit` `sound`). Never a long crossfade of two musics: for seconds they clash.

## Choosing the two

They should differ in what the picture's change is: soft and slow into driving and bright; sparse into full. Keep them related in key where you can (`scale` for generated music), and give the second a tempo that suits the action (110–128 for energy). Generated music follows the genre guidance in `scoring`.

## In Émile

1. `generate_music` (or `write_score`) for part 1: `from_seconds` 0, `to_seconds` the turn `T`.
2. The same for part 2: `from_seconds` `T`, `to_seconds` the next change or the end. Each part is laid on its own track; the music around it stays.
3. `place_sound` a riser, a boom and a sub-drop at `T`.
4. A breath (0.15–0.3 s of the first music and the riser stopping before `T`) makes the hit land harder: `trim` the riser, `split` the first music and `remove` the end piece.

## The tired version

- A new music on every cut.
- Two musics crossfaded for seconds.
- The change off the picture's turn.
- A hit with nothing new after it.
