---
name: sound-j-cut
description: A J-cut, the next shot's sound heard before its picture (audio lead, pre-lap): what it is for, how far ahead, and how to do it on Émile's timeline and with ffmpeg. Read when a cut goes into a new place that has a sound of its own.
kind: tool
---

# J-cut: hear it before you see it

The next shot's sound starts before its picture: the street's traffic comes up under the last seconds of the office, and then we cut to the street. The ear goes first and the eye follows, so the cut feels like arriving, not jumping. On a timeline the sound clip starts left of its picture: a J.

## When

- Into a new place whose own sound tells where we are: a street, a café, the sea, a crowd, a machine starting.
- Into a voice: the next speaker's first words heard over the end of the shot before.
- Not when the shot before has words being said (the two would talk over each other), and not into a shot without a sound of its own.

## How far ahead

| Film | Lead |
|---|---|
| Fast, a cut every 1–2 s | 0.3–0.6 s |
| Most product and brand films | 0.5–1.2 s |
| Slow, a calm scene change | 1–2 s |

Bring it in with a fade over the lead (it rises out of the shot before), and lower the shot before's own sound over the same time.

Under music the lead is easily lost: a street at its own level disappears under a track at −16 LUFS. Give the led sound gain 1.5–2.5 for the lead and the first second of its shot, or it isn't a J-cut at all; check that it is heard.

## In Émile

The next shot's sound is its video's own sound, part of the clip; to lead it, it has to be taken off as a sound clip (`timeline_edit` `detach_sound`), and that is the person's choice: **ask first** ("Shall I let the street be heard a second before we see it? That takes its sound off the clip as a clip of its own."). With a yes, at the seam `T`, lead `L`:

1. `detach_sound` the next video: its sound is now a sound clip over the same frames.
2. It can't start before its own file does, so the lead comes from the shot's head: `trim` and `move` are on the picture; instead, `move` the sound clip to start at `T − L` only when the video was trimmed at least `L` into its file (read_timeline gives `in`). When it wasn't, lay an ambience of the same kind from the catalogue (`list_sounds`, ambience) from `T − L` to `T` instead.
3. `sound` on that clip: `fade_in` = `L`.
4. `sound` on the shot before (its own sound): `fade_out` = `L`.

## With ffmpeg

Shot A ends and B starts at 6.0 s, lead 0.8 s, B's file has its sound from 0 (`b.wav` taken from the take with 0.8 s before its in point):

```bash
ffmpeg -i a.wav -i b.wav -filter_complex \
  "[0]afade=t=out:st=5.2:d=0.8[a];[1]adelay=5200|5200,afade=t=in:st=5.2:d=0.8[b];[a][b]amix=inputs=2:normalize=0" mix.wav
```

## The tired version

- A lead so long the sound no longer belongs to anything on screen.
- Leading into every shot: it stops meaning "a new place".
