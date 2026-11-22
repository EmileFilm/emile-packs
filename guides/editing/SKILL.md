---
name: editing
description: Cutting footage to a piece of music, as an editor does it: which stretch of each shot, in what order, how many beats each gets for the length asked, and the few cuts that earn a transition. Read before laying shots with assemble_shots, or when the person gives footage and music and asks for a cut.
kind: tool
---

# Cutting shots to music

A cut made to music is decided in beats, not seconds. Émile puts every cut on a beat and moves a shot's end onto its fastest moment; what it can't do is choose. The choosing is this page: which stretch of each shot, in what order, how long each stays, and where a transition is worth more than a cut.

## Listen, then look

1. `read_beats` on the music: its tempo, whether it holds, where the bars start. A beat is `60 / BPM` seconds; the length asked is `seconds × BPM / 60` beats. Write that number down: the shots' beats must add up to it.
2. `read_footage` on each video: how many shots it holds, how each moves, when it moves fastest.
3. `view_frames` on every stretch you may use. `read_footage` says how a shot moves, never what it shows.

Don't pick a shot you haven't seen.

## Which stretch

- A stretch is one thing happening: a jump, a turn of the head, a pour, a door, a car passing. Take the part where it happens and end on it; `read_footage` gives the moment (its `peaks`). The seconds before the action starts are the first to go.
- A still shot (a skyline, a product on a table) has no moment to end on: it is cut by the music alone, and it needs longer to be worth looking at.
- Leave out: the first and last half second of a file (the camera settling, the hand reaching for the button), a stretch whose subject can't be told in a glance, two stretches that look the same.
- One stretch from a shot, unless the film is about that one thing. The same shot twice reads as a mistake.

## Order

- Open on the shot that says where we are or makes one ask a question. Not on the best one.
- Change something at every cut: the scale (wide, then close), the subject, or the direction. Two wide shots in a row, or two close ones of the same thing, feel like one shot that jumped.
- Movement carries across a cut. A picture going left followed by one going left reads as one motion; left into right reads as a collision. Use the collision on purpose (a hit in the music) or not at all. `assemble_shots` tells you how the picture moves on each side of every cut: read it and reorder when two neighbours fight.
- Fast into still is a stop: keep it for the end of a phrase or the last shot. Still into fast is a start: put it on the first beat of a bar.
- The strongest shot goes about two thirds in, where the music is fullest. The last shot is one that can be held: still or slowing, never mid-action.

## How long: count beats

At 90–130 BPM:

| A shot that | gets |
|---|---|
| is pure action, glanced at | 1–2 beats |
| is the ordinary shot | 2–4 beats |
| must be read (a face, a product, words in the picture) | 4 beats or more, never under 1.5 s |
| opens or closes the film | 4–8 beats |

- Above 140 BPM count every second beat as one; under 80, a half beat.
- Pace follows the music's shape, not a constant: longer shots while it is sparse, shorter as it fills, the shortest run just before its high point, then one long shot to land. A run of 1-beat shots is at most four long; after it the eye needs a rest.
- Never the same length all the way through: three shots of 2 beats, then one of 4, is a phrase. Twelve shots of 2 beats is a slideshow.
- A big change (a new place, a new idea, the product for the first time) starts on the first beat of a bar. Give lengths that add up to whole bars (4, 8, 16 beats) up to that point.
- When the music's tempo drifts, give lengths in beats times the beat's length near that point; `read_beats` lists every beat.

Make the list add up before you hand it in: the sum of the lengths is the length asked. `assemble_shots` refuses a list that is more than a second off and says by how many beats; take them from the ordinary shots, never from the ones that must be read.

## Cut or transition

The hard cut on the beat is the default and almost always right: the beat is the transition. A transition is laid only where the two pictures ask for one:

- **Time or place changes** and both sides are calm (still, or slow): a dissolve, one or two beats.
- **Both sides move the same way**: a push or a slide in that direction, one beat, so the motion seems to carry the next shot in.
- **The film changes section** on a bar's first beat (verse into chorus, problem into product): one transition there, the only one near it.

Never: between two fast shots (the action is the cut), on every cut, more than about one cut in five, a different transition at each place it is used (one or two kinds in a film), a fade out followed by a fade in. `read_pack` a transition before laying it; its own guide says which pictures it fails on. A transition laid without a length is a beat long.

## In Émile

1. `read_skill editing` (this), `read_beats`, `read_footage` on each video, `view_frames` on the stretches.
2. One `assemble_shots` with the whole list in order, the music file and the length asked. A video is `{"file", "from", "to"}` in seconds of its file: `to` near the action's moment, `to − from` the length you counted. A picture is `{"file", "seconds"}`.
3. Problems come back together and nothing is laid: fix the list and hand it in again.
4. Read what it laid: each shot's beat, and how the picture moves on each side of every cut. Reorder and lay again when neighbours fight; then, only where the reasons above hold, `timeline_edit` `place_transition`.
5. `view_frames` on `"film"` around two or three cuts to see them as they play.

## The tired version

- Every shot two beats long from start to end.
- A cut on every beat because the music is fast.
- A transition on every cut, or a zoom-and-shake on each downbeat.
- The best shot first, and nothing left to build to.
- Ending mid-action because the music stopped.
