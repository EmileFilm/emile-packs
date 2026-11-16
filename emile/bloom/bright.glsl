// Bloom, first pass, at a quarter of the frame: what spills. Each pixel
// here covers four by four of the frame's, read as four bilinear taps so
// a light one pixel wide is not missed. Only light that is brighter than
// the threshold and stands out from what is around it spills (eight
// points 6% of the short side away): a white page or a bright product set
// has nothing standing out and stays as it is. A soft knee eases light in
// above the threshold instead of switching it on. Brightness is the
// brightest channel, so a saturated light (blue or red neon) counts as
// much as a white one.

float bloomLuma(vec3 c) { return max(c.r, max(c.g, c.b)); }

vec4 passColor(vec2 uv) {
  vec2 px = 1.0 / resolution;
  vec3 c = (getColor(uv + vec2(-1.0, -1.0) * px).rgb + getColor(uv + vec2(1.0, -1.0) * px).rgb
    + getColor(uv + vec2(-1.0, 1.0) * px).rgb + getColor(uv + vec2(1.0, 1.0) * px).rgb) * 0.25;
  float l = bloomLuma(c);
  float reach = 0.06 * min(resolution.x, resolution.y);
  float around = 0.0;
  for (int i = 0; i < 8; i++) {
    float t = float(i) * 0.7854;
    around += bloomLuma(getColor(uv + vec2(cos(t), sin(t)) * reach * px).rgb);
  }
  around /= 8.0;
  float from = max(p_threshold, around + 0.3);
  float knee = 0.08;
  float soft = clamp(l - from + knee, 0.0, 2.0 * knee);
  // How far over, as a share of what is left above the threshold
  float over = max(soft * soft / (4.0 * knee), l - from) / max(1.0 - from, 0.05);
  return vec4(c * min(over, 1.0) / max(l, 0.05) * min(l, 1.0), 1.0);
}
