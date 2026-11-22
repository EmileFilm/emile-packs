# End on a strong sound

A film whose music fades out sounds as if it ran out of time. One that stops on a strong sound sounds finished: the music cuts on the last moment, a hit lands, and its tail rings out over the final image or the logo.

## Where

On the last moment the picture gives: the last landing, the logo appearing, the product's last turn, the final word. Found to the frame. After it, 1.5–3 s of picture for the tail to ring (it is kept to the film's end), over the last shot, the logo, or black.

## How

- The music stops on that frame: cut, not faded (its clip ends there, by `trim` or the part's `to_seconds`, with `timeline_edit` `sound` `fade_out` 0.05 so it doesn't click). With a written score, its last note is a full chord on that beat, held.
- A hit on it (`place_sound`): `boom-02` or `boom-06` (big, long tail) for a dramatic film, `boom-03` (tight) for a crisp one, `boom-05` (soft, round) for a calm one; a `sub-drop-*` under it when it should be felt.
- The place's bed may run on quietly under the tail, or stop with the music for a cleaner end.
- Nothing else after it.

## The tired version

- A long fade-out over the last seconds.
- The hit after the picture has already ended.
- A final hit on nothing: an end with no last moment in the picture.
