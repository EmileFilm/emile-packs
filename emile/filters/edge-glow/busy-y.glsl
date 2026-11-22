// Edge glow, at an eighth of the frame: how crowded the outlines are
// around each point, the edges averaged over 8% of the short side (box,
// 17 taps). An outline standing alone against calm parts scores low; a
// mural, a crowd or shelves score high, and the last pass holds the light
// back there.

vec4 passColor(vec2 uv) {
  float r = 0.08 * min(resolution.x, resolution.y);
  vec3 sum = vec3(0.0);
  for (int i = -8; i <= 8; i++) {
    float x = float(i) / 8.0;
    sum += getPass_busy_x(uv + vec2(0.0, x * r / resolution.y)).rgb;
  }
  return vec4(sum / 17.0, 1.0);
}
