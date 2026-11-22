// Edge glow, the last pass, over the frame: the outlines of shapes lit as
// if from behind, a soft line of light on each (core-x.glsl, core-y.glsl)
// fading out into a halo (halo-x.glsl, halo-y.glsl), in one colour. The
// picture under it is dimmed by dim, most near the light, so the light
// reads; then the light is
// laid on as a screen through a soft shoulder (1 − e^−x), so it never
// flattens into a hard white line. amount 0 leaves the frame exactly as
// it is.

vec4 filterColor(vec2 uv) {
  vec4 here = getColor(uv);
  if (p_amount <= 0.0) return here;
  // What matters: an outline standing alone against calm parts of the
  // picture. Where outlines crowd (a mural, a crowd, shelves) busy-x and
  // busy-y find them dense, and the light there is held back
  vec3 core = getPass_core_y(uv).rgb, halo = getPass_halo_y(uv).rgb;
  float lc = max(dot(p_colour, vec3(0.2126, 0.7152, 0.0722)), 0.05);
  float crowd = dot(getPass_busy_y(uv).rgb, vec3(0.2126, 0.7152, 0.0722)) / lc;
  float alone = 1.0 - smoothstep(0.08, 0.2, crowd);
  vec3 light = (core * 2.2 + halo * 2.0) * alone;
  vec3 glow = (vec3(1.0) - exp(-light)) * p_amount;
  // The picture dims where the light falls and a little beyond (the wide
  // halo), so the light reads; far from any outline it is left as it is
  float near = 1.0 - exp(-dot(halo, vec3(0.2126, 0.7152, 0.0722)) / lc * 6.0 * alone);
  vec3 base = here.rgb * (1.0 - p_amount * mix(p_dim * p_dim, p_dim, near));
  float lit = max(glow.r, max(glow.g, glow.b));
  return vec4(base + glow * (1.0 - base), here.a + lit * (1.0 - here.a));
}
