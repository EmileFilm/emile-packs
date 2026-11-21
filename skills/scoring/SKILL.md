---
name: scoring
description: How to give a film its music in Émile: when to write a score on the instrument packs and when to generate music from a prompt, how to choose a tempo the cuts land on, how to shape the music to the film's sections, voice it so it sounds good, leave room for a voice-over, and the mistakes that make film music sound cheap. Read it before write_score or generate_music.
kind: tool
---

# Scoring a film

A film for a product or a company is short, and its music carries half its feeling. Good music for it is simple, follows the picture, and is never louder than what is said. This page is how to get there with Émile's two ways of making music.

## Which way

- **Write a score** (`write_score`) when the film's style suits the instruments there are (`list_instruments`: piano, strings, a plucked bass, harp, mallets, an acoustic kit, cinematic percussion) — calm, elegant, cinematic, warm, thoughtful, premium. It is the better way whenever the music should **follow the cuts**: chords change on them, hits land on them, a section breathes over a pause. It costs nothing and is the same every time it is played.
- **Generate** (`generate_music`) when the style needs sounds the instruments don't have — electronic, synth-pop, hip-hop, lo-fi, rock, a band — or the person names such a style. Its tempo holds, but its sections don't follow the cuts; lay cuts on its beats afterwards instead. Write the prompt as genre, two or three instruments and a mood in English ("minimal techno, warm analog bass, soft claps, focused"). Leave the seed at -1 so the prompt decides; offer another seed only when the person wants another version.
- **The person's own music** always wins: if they gave a track, use it and don't make another.

## Tempo: let the cuts choose it

The film's cuts are given to `score()` in seconds. Choose the tempo so that most cuts fall on a beat (or on the "and" between two):

```js
// The tempo (70–130) whose beats or half beats sit closest to the cuts
function tempoFor(cuts) {
  let best = 90, err = Infinity
  for (let bpm = 70; bpm <= 130; bpm += 0.5) {
    const half = 30 / bpm
    const e = cuts.reduce((s, c) => s + Math.abs(c / half - Math.round(c / half)), 0)
    if (e < err - 1e-9) { err = e; best = bpm }
  }
  return best
}
```

A cut that still falls between beats gets its own accent at its exact time (an `at` in beats need not be a whole number): the music bends to the picture, the picture never waits for the music.

## Shape: the film's sections, not loops

1. **Map the film first.** From the cuts, find its parts: an opening, the problem or the build, the turn (a reveal, the product appearing, a title), the close. A long gap between two cuts, or black, is a breath.
2. **One idea, growing.** Pick one figure (an arpeggio, a pulse, a held chord) in the opening and keep it all film; add a layer at each new section, never all at once. Typical order: piano or harp alone → strings under it → a pulse (spiccato, bass) → drums at the turn.
3. **Change chords on cuts**, not on bar lines, when a cut is near a bar. Four chords are enough for a whole film; a minor key for problem-to-solution, major for warm and confident, and the same key throughout.
4. **The turn is the loudest moment and the most important cut.** Thin out just before it (a beat or two of near silence, or one held note swelling), then land everything on it: low notes, a bass-drum or timpani hit, a crash.
5. **End on a held chord that rings** (two to three seconds of release before the film ends), not a cut-off.

## Voicing: what makes it sound expensive

- Low notes far apart, high notes close: in the bass only octaves and fifths (piano left hand, contrabass); below MIDI 48 never thirds. Most muddy music is too many notes under C3.
- Strings hold, piano moves: strings play long notes (2 beats or more, chord tones spread over two octaves); the movement is in the piano, harp or mallets.
- Leave the middle (MIDI 55–72) quiet when there is a voice-over: put the figure above it (harp, vibraphone, piano's top octave) and the pad below it, and keep velocities under 0.5 while someone speaks.
- Velocity is the dynamics: 0.3–0.5 for most notes, 0.6–0.8 for a section's peak, 0.9+ only on the turn. Accent the first of each group of notes slightly (+0.08) so a figure breathes.
- Density: an eighth-note figure in one instrument at a time. Two busy instruments together is clutter.
- Each instrument's guide (`read_pack emile/<name>`) says what it suits and its range: read the ones you use.

## Drums and hits

- The kit comes in at the turn or later, never under a calm opening. Kick on 1 and 3, snare on 2 and 4, hats in eighths at low velocity is enough; a fill of snare sixteenths rising over the last two beats into the turn.
- A hit (bass drum, timpani, crash) is for the turn and the close, and perhaps one more cut. A hit on every cut is the cheap version.
- A cymbal swell (`cinematic-perc` key 55) lasts two seconds: start it exactly two seconds before the cut it lands on.

## The tired version

- A glockenspiel ping or a riser on every cut.
- Four-on-the-floor kick under the whole film.
- The same eight-bar loop from start to end, unchanged.
- Music that starts at full volume and has nowhere to go.
- A key change, a solo, or a melody that competes with the words.

## The module

`write_score` takes the module's code. Its default export gets `{ seconds, cuts, bpm }` and returns `{ bpm, notes }`; `at` and `beats` are in beats from the film's start, `pitch` is MIDI, `velocity` 0–1, `instrument` a name from `list_instruments`. Write it as data and small loops, not as a list of hundreds of literal notes:

```js
export default function score({ seconds, cuts }) {
  const bpm = 96, beat = s => (s * bpm) / 60, notes = []
  const n = (instrument, pitch, at, beats, velocity) => notes.push({ instrument, pitch, at, beats, velocity })
  const edges = [0, ...cuts, seconds].map(beat)
  const chords = [[57, 64, 71, 72], [53, 60, 67, 69], [48, 55, 64, 72], [55, 62, 67, 71]]
  edges.slice(0, -1).forEach((from, i) => {
    const to = edges[i + 1], ch = chords[i % chords.length]
    for (let t = from, j = 0; t < to - 0.01; t += 0.5, j++) n('piano', ch[[0, 1, 2, 3, 1, 2, 3, 1][j % 8]], t, 0.8, 0.4 + (j % 4 ? 0 : 0.08))
    if (i > 0) n('strings', ch[0] - 12, from, to - from, 0.45)
  })
  return { bpm, notes: notes.filter(x => x.at < beat(seconds)) }
}
```

When `write_score` refuses the score it lists every problem at once (a note past the end, out of an instrument's range, an unknown instrument): fix them all and send it again under the same name. Its answer gives the beats: lay later cuts on them.
