---
name: sound-strong-ending
description: Ending a film on one strong sound instead of a fade: the music cut on its last hit with the picture's last moment, a big boom ringing out over the final shot or into black. Where, which sound, and how in Émile. Read for the end of every film.
kind: tool
---

# End on a strong sound

A film whose music fades out sounds as if it ran out of time. One that stops on a strong sound sounds finished: the music cuts on the last moment, a hit lands, and its tail rings out over the final image or the logo.

## Where

On the last moment the picture gives: the last landing, the logo appearing, the product's last turn, the final word. Found to the frame. After it, 1.5–3 s for the tail to ring, over the last shot, the logo, or black.

## How

- The music stops on that frame: cut, not faded (a fade of 1–2 frames only, so it doesn't click). With a written score, its last note is a full chord on that beat, held.
- A hit on it: `boom-02` or `boom-06` (big, long tail) for a dramatic film, `boom-03` (tight) for a crisp one, `boom-05` (soft, round) for a calm one; a `sub-drop-*` under it when it should be felt.
- The place's bed may run on quietly under the tail, or stop with the music for a cleaner end.
- Nothing else after it.

## In Émile

With the last moment at `E`:
1. The music: its clip ends at `E` (`trim`, or the part's `to_seconds`), `timeline_edit` `sound` `fade_out` 0.05.
2. `place_sound` the boom at `E` (its tail is kept to the film's end: leave 1.5–3 s of picture after `E`).
3. The film's last picture runs to `E` + 1.5–3 s.

## The tired version

- A long fade-out over the last seconds.
- The hit after the picture has already ended.
- A final hit on nothing: an end with no last moment in the picture.
