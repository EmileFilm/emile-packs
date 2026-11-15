---
name: halftone
description: A picture pulled through a printer's screen, ink dots on paper, bold enough to read as print.
---

# Halftone

Gives a picture the bluntness of something published: one ink, one paper, dots you can count. Blacks print solid, whites stay bare paper, and everything between is a screen of round dots.

## Role
Structure: it remakes the picture. Colour under it is lost; a finish (grain) may go over it.

## When to use
Only when the story asks for print, never as decoration.
- **A statement that should feel published** (a headline, a quote, a launch date, "as seen in"): the frame as a press cutting. cell 14–18, near-black ink on warm paper.
- **A poster beat** (a face or a product's silhouette held one to three seconds on the music): cell 28–40, the brand's dark colour as ink.
- **The past** (how it began, the old way of doing it): cell 10–14, exposure 0.2.
- Words that call for it: print, newspaper, editorial, zine, poster, manifesto, archive, punk.

## Suits
- Portraits lit from one side and products on a plain ground: the shape survives as dots (checked on a mid-key and a coloured-light portrait and a product set).
- Bold type from 48 px up: black type prints solid and stays crisp.
- amount 0.5 lays the dots over the picture in its own colours: a softer, printed-colour look.

## Doesn't suit
- Dark pictures: most of the frame prints solid and the subject is lost (a low-key portrait, a night set). Raise exposure to 0.5–0.8 and the face comes back as dots; on a bright picture keep it at 0.
- Text in a mid-tone or a colour, and any text under 32 px: it breaks into dots.
- More than about five seconds at a time: it tires the eye. Use it for a section.

## The tired version
The tired version is a film of tiny grey dots that only makes the picture dirty, or rainbow pop-art dots on yellow. Keep cell at 10 or more, one ink, paper off-white (never pure white), and no neon ink.

## How long
An accent: one moment of 1–4 seconds (a line, a poster held still), five seconds at most for a section. Never over a shot whose information must be read (an interface, numbers, body text).

## Parameters
- `amount` 0–1: 1 is the print; 0.5 dots over the picture's own colours.
- `cell` 6–80 (pixels of a 1080-pixel frame): 10–14 a fine screen, 18 the default, 28–40 poster dots.
- `exposure` −1 to 1: lightens (above 0) or darkens the picture before it is screened.
- `ink`, `paper`: a dark and a light colour; swap them (light ink on dark paper) for a night look.
