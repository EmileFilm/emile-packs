---
name: emile-sounds
description: Sixty-four CC0 sound effects as WAV files (clicks, pops, whooshes, rises, drops, impacts, notification chimes and ambience beds), each with its length and a line on how it sounds, and how to lay one at a moment of a video with ffmpeg. Use when a video, an animation, an app or product demo, a slideshow or a presentation needs a sound on a moment (a tap, a card appearing, a transition, a title landing, a success). Not for music, voice, or long field recordings.
---

{{generated}}

# Émile sounds

Sixty-four short sound effects from Émile, a video editor, all CC0 (free for any use, no credit needed): eight for each of eight kinds of moment. Each is `sounds/<name>.wav`, 48 kHz 16-bit stereo, its peak at −1 dBFS. `sounds.json` lists them for a program: name, tag, seconds, how it sounds, source.

{{sounds}}

## Rules

- **A sound follows something seen.** Lay it on the frame where the thing happens (the finger lands, the card is fully in, the title stops), not before. Every sound you add should be something you could point at on screen.
- **Fewer is better.** One sound per event, a few per ten seconds at most; a sound on every cut or every word is the cheap version. Interface sounds (`click`, `pop`, `notify`) belong to interface moments, `whoosh` to movement across the frame, `impact` to the one or two hits that matter, `rise` into a reveal (start it so it ends on the reveal).
- **Under the rest.** Mix effects about 10–16 dB below the voice, and below the music's peaks; an `ambience` bed lower still, faded in and out over half a second.
- **Same kind, same sound.** Use one click for every tap in a film, one pop for every card: varying them reads as noise.

## Laying one with ffmpeg

A sound at 3.2 s into a video, 12 dB down, mixed with the video's own audio:

```sh
ffmpeg -i film.mp4 -i sounds/click-03.wav -filter_complex \
  "[1:a]adelay=3200|3200,volume=-12dB[s];[0:a][s]amix=inputs=2:normalize=0:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy out.mp4
```

A video with no audio: use `[s]` alone as the output, with `apad` and `-shortest`. Several sounds: one `adelay` chain each, all into one `amix`.
