---
name: risograph
description: A two-colour print run, two inks laid one over the other, a little out of register, on uncoated paper.
---

# Risograph

The warmth of a small print run: two inks, sandy where they thin out, darker where they overlap, never quite lined up. Each colour of the picture goes to the ink nearest it, and the darks get both.

## 角色
结构 (structure): it remakes the picture in two inks. Nothing goes under it but the picture; a finish is not needed (it brings its own sand and paper).

## 何时用
Only when the film wants to feel made by hand, by people.
- **An independent or creative brand introducing itself** (a studio, a community, a festival, an event date): the whole intro or a title card.
- **A friendly "how it works"** where a clean screen would feel cold: one section, with the brand's two colours as inks.
- **Chapter cards and the end card** over a photo or a flat ground.
- Words that call for it: riso, risograph, zine, two-colour print, print shop, indie, craft, hand-made, playful; 孔版、双色印刷、手作感、独立杂志、市集海报、文艺.

## 适合
- A warm subject on a cool or plain ground: they separate into the two inks (a face in the second ink, its backdrop in the first; checked on a mid-key and a coloured-light portrait).
- A product's screen: type stays readable, the accent colour goes to one ink.
- grain 0.4–0.7 for the sandy screen, misregister 0.2–0.5.

## 不适合
- Dark pictures: two inks overprinted only reach a dark plum, so a low-key frame turns to one murky field (checked on a low-key portrait; no setting mends it).
- A picture all in one hue (a blue lake printed in blue and red is just blue).
- Colours that must be exact (a brand colour, a product's colour): every colour becomes a mix of the two inks.

## 俗套
The tired version is a pink-and-cyan gradient with noise laid on top. Choose inks that exist in a print shop's drums and are not neon: blue #2f4fa2 with bright red #f0523f (default), teal #00838a with orange #ff6c2f, black #232323 with red #e8452c. Keep misregister under 0.5: more looks like a mistake, not a print.

## 参数
- `amount` 0–1: 1 is the print.
- `ink_a`, `ink_b`: the two inks. Cool and dark things go to the one nearer them, warm things to the other.
- `grain` 0–1: 0 flat tints, 0.6 the default sand, 1 hard specks.
- `misregister` 0–1: how far the second ink sits off the first.
