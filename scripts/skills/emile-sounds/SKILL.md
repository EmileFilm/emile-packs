---
name: emile-sounds
description: Ninety-six CC0 sound effects as WAV files (clicks, pops, whooshes, rises, drops, impacts, notification chimes, ambience beds, and for transitions risers, reversed swells, sub drops and long sweeps), each with its length, the moment in it that goes on the picture's moment, and a line on how it sounds, and how to lay one at a moment of a video with ffmpeg. Use when a video, an animation, an app or product demo, a slideshow or a presentation needs a sound on a moment (a tap, a card appearing, a transition, a title landing, a success). Not for music, voice, or long field recordings.
---

{{generated}}

# Émile sounds

Ninety-six sound effects from Émile, a video editor, all CC0 (free for any use, no credit needed): eight for each of twelve kinds of moment. Each is `sounds/<name>.wav`, 48 kHz 16-bit stereo, its peak at −1 dBFS. `sounds.json` lists them for a program: name, tag, seconds, cut, how it sounds, source.

**Cut at** is the moment in the file that belongs on the picture's moment: a click's or a hit's attack, a whoosh's or a sweep's peak, a riser's and a swell's end, a sub-drop's start. To lay a sound on a moment `T`, start it at `T − cut`. The four transition kinds (riser, swell, sub-drop, sweep) are synthesised by Émile; the rest were chosen from CC0 packs. How to use them across a cut (a whoosh on a push, a riser into a reveal, a J-cut) is in the `sound-transitions` Skill and the seven beside it in this repository.

{{sounds}}

## Rules

- **A sound follows something seen.** Lay it on the frame where the thing happens (the finger lands, the card is fully in, the title stops), not before. Every sound you add should be something you could point at on screen.
- **Fewer is better.** One sound per event, a few per ten seconds at most; a sound on every cut or every word is the cheap version. Interface sounds (`click`, `pop`, `notify`) belong to interface moments, `whoosh` to movement across the frame, `impact` to the one or two hits that matter, `riser` or `swell` into a reveal (it ends on the reveal), with `impact` and `sub-drop` on it.
- **Under the rest.** Mix effects about 10–16 dB below the voice, and below the music's peaks; an `ambience` bed lower still, faded in and out over half a second.
- **Same kind, same sound.** Use one click for every tap in a film, one pop for every card: varying them reads as noise.

## Laying one with ffmpeg

A click (cut at 0.005 s) on a tap at 3.2 s into a video, so it starts at 3.195 s, 12 dB down, mixed with the video's own audio:

```sh
ffmpeg -i film.mp4 -i sounds/click-03.wav -filter_complex \
  "[1:a]adelay=3195|3195,volume=-12dB[s];[0:a][s]amix=inputs=2:normalize=0:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy out.mp4
```

A video with no audio: use `[s]` alone as the output, with `apad` and `-shortest`. Several sounds: one `adelay` chain each, all into one `amix`.
