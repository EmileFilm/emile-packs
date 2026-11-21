---
name: sound-music-handoff
description: Changing or ending the film's music at a cut: on a downbeat, from one section or track to the next, stopping dead for effect, and ending on a hit instead of a fade. Read when the music has to change at a scene change, and for every film's end.
kind: tool
---

# Music handoff: change on the downbeat, end on a hit

Music changes are cuts too, and they are heard. A change on the downbeat (the first beat of a bar) feels like the film turning a page; anywhere else it feels like a skip. And music that fades out at the end sounds like the film ran out of time; music that ends on a hit sounds finished.

## When

- A scene change big enough for new music (from the problem to the solution, from the story to the call to action).
- The end of every film.
- A stop for emphasis: the music cut dead on a downbeat for a line, a reveal or a joke, then back in on the next.

## How

- **Section to section, or track to track**: cut the old on a downbeat at the scene's cut and start the new on its own downbeat; a 20–50 ms crossfade hides the join. Never a long crossfade of two pieces of music: for seconds they clash.
- **Stopping dead**: on a downbeat, with the picture's cut; the silence is the point, so nothing fills it. Back on the next downbeat.
- **The end**: the music's last hit (its final chord, a downbeat) lands on the last cut or on the logo, then rings out (1–3 s). When the music is longer than the film, cut it before a hit and move that hit to the end, rather than fading.

## In Émile

- The beats: `write_score` and `generate_music` give the music's beats and downbeats; a person's own track has them in its record after `music` (read the timeline).
- A written score: write the change into it (a new section starting on the downbeat at the cut; the last chord on the last cut, held 2–3 s). That is the best way: the score follows the cuts.
- A generated or given track: `split` the music clip on the downbeat nearest the cut, and `remove`, `move` or `trim` the pieces; set `fade_out` 0.03 on the piece that stops and `fade_in` 0.02 on the one that starts. For the end: `split` on a downbeat that holds a hit, `move` the piece from there to land its hit on the last cut, and give it a `fade_out` only over its last second of ring.

## With ffmpeg

The end hit of a track at 41.0 s moved to land on the film's last cut at 28.0 s (the track cut at its downbeat 27.5 s, the piece from 40.5 s joined there):

```bash
ffmpeg -i music.wav -filter_complex \
  "[0]atrim=0:27.5,afade=t=out:st=27.47:d=0.03[a];[0]atrim=40.5,asetpts=PTS-STARTPTS,afade=t=in:d=0.02[b];[a][b]concat=n=2:v=0:a=1" end.wav
```

## The tired version

- Every film ending on a fade-out.
- Two tracks crossfaded over three seconds.
- A change half a beat off the downbeat: it sounds like a skip.
