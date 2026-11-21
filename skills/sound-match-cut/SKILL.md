---
name: sound-match-cut
description: A sound match cut, one sound turning into another across a cut (a helicopter's blades into a ceiling fan, a keyboard's tap into a raindrop) so two shots are joined by what we hear. When it works, how to find one, and how to time it. Read when two shots share a motion, a rhythm or a shape.
kind: tool
---

# Sound match cut: one sound becomes another

Two shots are joined by a sound that belongs to both: the click of a pen becomes the click of a camera's shutter, a heartbeat becomes a kick drum, the hiss of a coffee machine becomes the hiss of the sea. The cut is a small surprise and an idea at once: these two things are alike.

## When

- Two shots share a motion or a rhythm (something spinning, tapping, pulsing, pouring) or a shape that makes the same kind of sound.
- The film wants to say the two are connected: the everyday task and the product that does it, before and after.
- Once in a film. It is a flourish; twice is a trick.

## How

1. Find the pair: the last beat of the sound in the shot before and the first in the shot after should fall on the same rhythm.
2. Cut on the sound's attack: the shot before's sound ends on a hit, and the shot after starts on the matching hit (or one beat later).
3. Cross the two over 0.1–0.3 s around the cut, the first fading out under the second, so the ear hears one sound changing, not two.
4. When neither shot has the sound, the catalogue can lend one to both: the same click, pop or impact laid at the end of the first and on the cut (two `place_sound`, the second louder).

## In Émile

- The two shots' own sounds: put a transition of 0.2 s between them (it crosses their sounds) or, for a hard cut, set `fade_out` 0.1 on the first and `fade_in` 0.1 on the second.
- A lent sound: `place_sound` it on the last tap in the first shot and on the cut; gain 0.5 and 0.8.
- Choosing the cut point within a shot's movement needs its picture: look at the frames (read the shot) before you move the cut.

## The tired version

- A match nobody can hear because the two sounds are buried under music: lower the music for that second, or don't do it.
- A pun: matching sounds whose shots have nothing else in common.
