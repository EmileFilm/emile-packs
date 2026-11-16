// Bloom, the last pass, over the frame: light spilling from the brightest
// points into the dark around them, as a lens and film do. The passes
// before it, at a quarter of the frame so a wide glow is cheap, picked
// out the light that stands out (bright.glsl) and spread it twice: a
// quarter of the radius (tight-x.glsl, tight-y.glsl) and the whole radius
// (blur-x.glsl, blur-y.glsl). The two together fall off smoothly: bright
// close to a light, faint far from it. warmth turns the wide glow, more
// than the tight one, towards the red-orange of film halation. Laid on as
// a screen through a soft shoulder, so black stays black away from light
// and nothing flattens into a disc of white;
// amount 0 leaves the frame exactly as it is.

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  vec3 halation = vec3(1.9, 0.62, 0.3);
  vec3 tight = getPass_tight_y(uv).rgb;
  vec3 wide = getPass_blur_y(uv).rgb;
  tight = mix(tight, dot(tight, vec3(0.2126, 0.7152, 0.0722)) * halation, p_warmth * 0.4);
  wide = mix(wide, dot(wide, vec3(0.2126, 0.7152, 0.0722)) * halation, p_warmth);
  // A soft shoulder instead of a clip: strong light rolls off towards
  // white instead of flattening into a disc
  vec3 spill = (vec3(1.0) - exp(-(tight * 0.8 + wide * 3.0))) * p_amount;
  float lit = max(spill.r, max(spill.g, spill.b));
  return vec4(here.rgb + spill * (1.0 - here.rgb), here.a + lit * (1.0 - here.a));
}
