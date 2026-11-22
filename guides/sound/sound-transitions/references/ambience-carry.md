# A place's sound across the cut

Every place has a sound: water, a street, a room's air. Cut it dead with the picture and each shot starts in a vacuum. Carried across the cut it joins the shots: the next place is heard before it is seen (it draws us in), or this one lingers after we have left (it lets a moment settle).

## Which way

| The cut | Move | How long |
|---|---|---|
| Into a new place we should arrive in | its sound first (J-cut) | 0.5–1.5 s before the cut |
| Out of a place or a moment that should linger | its sound on (L-cut) | 0.5–2 s after the cut, fading |
| Between two shots of one place | one bed under both, no change | — |
| A shot with no sound of its own (most stock, drone and generated footage) | a bed that matches what we see | its length, plus 0.5 s each side |

## The beds

Footage often has no sound: give it one that matches the picture, quietly. Each bed says its place (`list_sounds`: room, building, city-night, street-day, wind, rain, water, sea, car). `lay_beds` lays them for a whole film at once from the place of each shot: it joins shots of one place, lays as many takes as a long stretch needs, crosses beds over 0.5 s where the place changes, and leaves a video's own sound alone. The `ambience-*` sounds are machines and engines: only for a sci-fi or technical picture, laid by hand.

## Under music

A place's sound at its own level vanishes under music. Where the carry should be heard (the J-cut's lead, the last second of an L-cut), give it gain 1.5–2; the rest of the time it sits under the music at 1.

## In Émile

- Beds for the whole film: `lay_beds` with each shot's place. One bed by hand: `place_sound` it on the moment it starts (a bed's cut is 0), `trim` it to where it ends, `timeline_edit` `sound` with `fade_in` and `fade_out` 0.5.
- A J-cut with a bed: lay the next place's bed from the cut minus the lead, fading in over the lead; fade the current one out over the same time.
- A J-cut or L-cut of a video's own sound takes it off the clip (`detach_sound`): **ask the person first**. Then `move` the sound clip (it then plays that much ahead of or behind its picture all along: right for a place's sound, wrong for words or a sound tied to something seen) and set its fades.

## The tired version

- Silence under footage that has no sound.
- A bed that doesn't match the picture (rain under sunshine).
- Two beds stacked where one place continues: they add up to noise.
